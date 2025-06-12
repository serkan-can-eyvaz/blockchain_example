package com.textile.service;

import com.textile.entity.Product;
import com.textile.entity.ProductStatus;
import com.textile.entity.Transaction;
import com.textile.entity.TransactionType;
import com.textile.entity.User;
import com.textile.entity.UserRole;
import com.textile.repository.TransactionRepository;
import com.textile.service.BlockchainService;
import com.textile.model.ProductTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final ProductService productService;
    private final UserService userService;
    private final BlockchainService blockchainService;

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        Product product = productService.getProductById(transaction.getProduct().getId());
        User user = userService.getUserById(transaction.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        transaction.setProduct(product);
        transaction.setUser(user);

        // blockchain_hash üret
        transaction.setBlockchainHash(UUID.randomUUID().toString());

        // İşlem tipine göre ürün durumunu güncelle
        switch (transaction.getType()) {
            case URETIM_BASLADI:
                product.setStatus(ProductStatus.URETIM_ASAMASINDA);
                break;
            case URETIM_TAMAMLANDI:
                product.setStatus(ProductStatus.URETIM_TAMAMLANDI);
                break;
            case KALITE_KONTROL:
                product.setStatus(ProductStatus.KALITE_KONTROL);
                break;
            case DEPOYA_ALINDI:
                product.setStatus(ProductStatus.DEPOYA_ALINDI);
                break;
            case DAGITIMA_HAZIR:
                product.setStatus(ProductStatus.DAGITIMA_HAZIR);
                break;
            case DAGITIMDA:
                product.setStatus(ProductStatus.DAGITIMDA);
                break;
            case PERAKENDE_SATIS:
                product.setStatus(ProductStatus.PERAKENDE_SATIS);
                break;
            case SATIS_TAMAMLANDI:
                product.setStatus(ProductStatus.SATIS_TAMAMLANDI);
                break;
        }

        productService.updateProduct(product.getId(), product);
        Transaction savedTransaction = transactionRepository.save(transaction);

        // Blockchain'e işlemi ekle
        ProductTransaction tx = new ProductTransaction();
        tx.setProductId(product.getId());
        tx.setAction(transaction.getType().toString());
        tx.setActorUsername(user.getUsername());
        tx.setTimestamp(System.currentTimeMillis());
        tx.setDescription(transaction.getDescription());
        tx.setPreviousState(product.getStatus().toString());
        tx.setDeleted(false);
        
        blockchainService.addTransaction(tx);
        blockchainService.minePendingTransactions();

        return savedTransaction;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<Transaction> getTransactionsByCurrentUser(User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return transactionRepository.findAll();
        }
        return transactionRepository.findByUser(currentUser);
    }

    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("İşlem bulunamadı"));
    }

    public Transaction getTransactionByIdAndUser(Long id, User currentUser) {
        Transaction transaction = getTransactionById(id);
        if (currentUser.getRole() != UserRole.ADMIN && !transaction.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bu işleme erişim yetkiniz yok");
        }
        return transaction;
    }

    public List<Transaction> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductId(productId);
    }

    public List<Transaction> getTransactionsByProductAndUser(Long productId, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return transactionRepository.findByProductId(productId);
        }
        return transactionRepository.findByProductIdAndUser(productId, currentUser);
    }

    public List<Transaction> getTransactionsByUser(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getTransactionsByType(TransactionType type) {
        return transactionRepository.findByType(type);
    }

    public List<Transaction> getTransactionsByTypeAndUser(TransactionType type, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return transactionRepository.findByType(type);
        }
        return transactionRepository.findByTypeAndUser(type, currentUser);
    }

    public UserService getUserService() {
        return userService;
    }

    public ProductService getProductService() {
        return productService;
    }
} 