import json
import hashlib
import time

class Block:
    def __init__(self, index, transactions, timestamp, previous_hash):
        self.index = index
        self.transactions = transactions
        self.timestamp = timestamp
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        block_data = {
            "index": self.index,
            "transactions": self.transactions,
            "timestamp": self.timestamp,
            "previous_hash": self.previous_hash,
            "nonce": self.nonce
        }
        block_string = json.dumps(block_data, sort_keys = True)
        return hashlib.sha256(block_string.encode()).hexdigest()



class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]
        self.pending_transactions = []

    def create_genesis_block(self):
        return Block(0, [], time.time(), "0")
    
    def add_transaction(self, transaction):
        self.pending_transactions.append(transaction)

    def mine_pending_transanction(self):
        new_block = Block (
            index= len(self.chain),
            transactions = self.pending_transactions,
            timestamp = time.time(),
            previous_hash = self.get_latest_block().hash
        )

        self.chain.append(new_block)
        self.pending_transactions = []

    

    def get_latest_block(self):
        return self.chain[-1]


    def has_voted(self, voter_id):
        for block in self.chain:
            for transaction in block.transactions:
                if (transaction["voter_id"] == voter_id):
                    return True
        return False
    
    def print_chain(self):
        for block in self.chain:
            print(f"\n --- Block #{block.index} ---")
            print(f"Zaman: {block.timestamp}")
            print(f"Önceki Hash: {block.previous_hash}")
            print(f"Nonce: {block.nonce}")
            print(f"Bu Block Hash: {block.hash}")
            print(f"İşlemler: {block.transactions}")

    def count_votes(self):
        results = {}
        for block in self.chain:
            for transaction in block.transactions:
                vote = transaction["vote"]
                results[vote] = results.get(vote, 0) + 1
        return results

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]

            if current.hash != current.calculate_hash():
                print(f"Blok {current.index} geçersiz! Veri değitirilmiş olabilir")
                return False

            if current.previous_hash != previous.hash:
                print("Zincir kopmuş! Veri güvende değil")
                return False
        return True
        