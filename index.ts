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

    addBlock(
        transaction: Transaction,
        senderPublicKey: string,
        signature: string
    ){
        const newBlock = new Block(this.lastBlock.hash,transaction);
        this.chain.push(newBlock)
    }

}

class Wallet{
    public publicKey: string;
    public privateKey: string;

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
    }

    sendMoney(
        amount: number,
        payeePublicKey: string
    ){
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign('sha256');
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
    }
}