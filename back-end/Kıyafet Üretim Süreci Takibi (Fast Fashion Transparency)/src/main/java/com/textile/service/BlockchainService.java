package com.textile.service;

import com.textile.entity.Block;
import com.textile.repository.BlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.ArrayList;
import com.textile.model.ProductTransaction;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class BlockchainService {
    private final BlockRepository blockRepository;
    private final List<ProductTransaction> pendingTransactions = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<Block> blockchain = new ArrayList<>();

    public Block createGenesisBlock() {
        Block genesis = new Block();
        genesis.setIndex(0);
        genesis.setTimestamp(System.currentTimeMillis());
        genesis.setPreviousHash("0");
        genesis.setNonce(0);
        genesis.setTransactionsJson("[]");
        genesis.setHash(calculateHash(genesis));
        return blockRepository.save(genesis);
    }

    public Block getLatestBlock() {
        List<Block> blocks = blockRepository.findAll();
        if (blocks.isEmpty()) {
            return createGenesisBlock();
        }
        return blocks.get(blocks.size() - 1);
    }

    public Block addBlock(String transactionsJson) {
        Block previous = getLatestBlock();
        Block block = new Block();
        block.setIndex(previous.getIndex() + 1);
        block.setTimestamp(System.currentTimeMillis());
        block.setPreviousHash(previous.getHash());
        block.setTransactionsJson(transactionsJson);
        // Proof of Work algoritması ile blok doğrulama
        int nonce = 0;
        String hash;
        do {
            block.setNonce(nonce);
            hash = calculateHash(block);
            nonce++;
        } while (!hash.startsWith("0000"));
        block.setHash(hash);
        return blockRepository.save(block);
    }

    public List<Block> getAllBlocks() {
        return blockRepository.findAll();
    }

    public boolean isChainValid() {
        List<Block> blocks = blockRepository.findAll();
        for (int i = 1; i < blocks.size(); i++) {
            Block current = blocks.get(i);
            Block previous = blocks.get(i - 1);
            if (!current.getHash().equals(calculateHash(current))) return false;
            if (!current.getPreviousHash().equals(previous.getHash())) return false;
        }
        return true;
    }

    private String calculateHash(Block block) {
        try {
            String data = block.getIndex() + block.getTimestamp() + block.getPreviousHash() + block.getTransactionsJson() + block.getNonce();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algoritması bulunamadı", e);
        }
    }

    public void addTransaction(ProductTransaction transaction) {
        pendingTransactions.add(transaction);
    }

    public Block minePendingTransactions() {
        try {
            String transactionsJson = objectMapper.writeValueAsString(pendingTransactions);
            Block block = addBlock(transactionsJson);
            pendingTransactions.clear();
            return block;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Transactionları JSON'a çevirirken hata oluştu", e);
        }
    }

    public boolean replaceChain(List<Block> newChain) {
        if (newChain.size() > getAllBlocks().size() && isChainValid(newChain)) {
            blockRepository.deleteAll();
            blockRepository.saveAll(newChain);
            return true;
        }
        return false;
    }

    public boolean isChainValid(List<Block> chain) {
        for (int i = 1; i < chain.size(); i++) {
            Block current = chain.get(i);
            Block previous = chain.get(i - 1);
            if (!current.getHash().equals(calculateHash(current))) return false;
            if (!current.getPreviousHash().equals(previous.getHash())) return false;
        }
        return true;
    }

    public List<Block> getBlockchain() {
        return blockchain;
    }

    public void syncBlocks(List<Block> peerBlocks) {
        if (peerBlocks.size() > blockchain.size()) {
            // Eğer peer'ın zinciri daha uzunsa, kendi zincirimizi güncelle
            blockchain = new ArrayList<>(peerBlocks);
        }
    }

    public void addBlock(Block block) {
        // Blok doğrulaması yap
        if (isValidBlock(block)) {
            blockchain.add(block);
        }
    }

    private boolean isValidBlock(Block block) {
        if (blockchain.isEmpty()) {
            return block.getIndex() == 0 && block.getPreviousHash() == null;
        }

        Block lastBlock = blockchain.get(blockchain.size() - 1);
        return block.getIndex() == lastBlock.getIndex() + 1 &&
               block.getPreviousHash().equals(lastBlock.getHash());
    }
} 