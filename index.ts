import * as crypto from 'crypto';

class Transaction{
    constructor(
        public amount: number,
        public payer: string, //public key
        public payee: string //public key
    ){}

    toString(){
        return JSON.stringify(this)
    }
}

class Block{

    public nonce = Math.round( Math.random() * 999999999);

    constructor(
        public prevHash: string, //hash of previous block
        public transaction: Transaction, //transaction
        public ts = Date.now() //Time 
    ){}

    get hash(){
        const str = JSON.stringify(this);
        const hash = crypto.createHash('sha256');
        hash.update(str).end();
        return hash.digest('hex');
    }
}

class Chain{    
    public static instance = new Chain();
    chain: Block[]; // An Array of Block objects

    constructor(){
        this.chain = [new Block("",new Transaction(100,'genesis','kaushik'))]; //genesis block
    }

    get lastBlock(){
        return this.chain[this.chain.length-1]
    }

    mine(nonce: number){
        let solution = 1;
        console.log('Mining....')
        while(true){
            const hash = crypto.createHash('md5');
            hash.update((nonce+solution).toString()).end()
            const attempt = hash.digest('hex')
            if(attempt.substr(0,4)==='0000'){
                console.log(`Solved: ${solution}`);
                return solution;
            }
            solution++;
        }
    }

    addBlock(
        transaction: Transaction,
        senderPublicKey: string,
        signature: Buffer
    ){
        const verifier = crypto.createVerify('sha256');
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        if(isValid){
            const newBlock = new Block(this.lastBlock.hash,transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    }

}

class Wallet{
    public publicKey: string;
    public privateKey: string;
    public amount: number;
    constructor(){
        const keypair = crypto.generateKeyPairSync('rsa',{
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
        this.amount = 0;
    }

    sendMoney(
        amount: number,
        payee: Wallet
    ){
        const transaction = new Transaction(amount, this.publicKey, payee.publicKey);
        const sign = crypto.createSign('sha256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction,this.publicKey, signature);
        this.amount -= amount
        payee.amount += amount
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//Example Usage:

/* const satoshi = new Wallet();
const bob = new Wallet();
const alice = new Wallet();

satoshi.sendMoney(50,bob);
bob.sendMoney(23,alice);
alice.sendMoney(5,bob);

console.log(Chain.instance)
 */