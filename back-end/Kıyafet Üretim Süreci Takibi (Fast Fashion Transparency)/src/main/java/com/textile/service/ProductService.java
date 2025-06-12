package com.textile.service;

import com.textile.entity.Product;
import com.textile.entity.ProductStatus;
import com.textile.entity.User;
import com.textile.entity.UserRole;
import com.textile.repository.ProductRepository;
import com.textile.service.BlockchainService;
import com.textile.model.ProductTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final BlockchainService blockchainService;

    @Transactional
    public Product createProduct(Product product) {
        // Smart Contract: Üretici kontrolü
        if (product.getProducer() == null || product.getProducer().getRole() != UserRole.PRODUCER) {
            throw new RuntimeException("Ürün oluşturma yetkisi sadece üreticilere aittir");
        }

        System.out.println("KAYDEDİLEN ÜRÜN: " + product);
        product.setBlockchainHash(UUID.randomUUID().toString());
        Product saved = productRepository.save(product);
        // Blockchain'e ekle
        ProductTransaction tx = new ProductTransaction();
        tx.setProductId(saved.getId());
        tx.setAction("URUN_EKLENDI");
        tx.setActorUsername(saved.getProducer().getUsername());
        tx.setTimestamp(System.currentTimeMillis());
        blockchainService.addTransaction(tx);
        blockchainService.minePendingTransactions();
        return saved;
    }

    public List<Product> getAllProducts() {
        return productRepository.findByDeletedFalse();
    }

    public List<Product> getProductsByCurrentUser(User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return productRepository.findByDeletedFalse();
        }
        return productRepository.findByProducerAndDeletedFalse(currentUser);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));
    }

    public Product getProductByIdAndUser(Long id, User currentUser) {
        Product product = getProductById(id);
        if (currentUser.getRole() != UserRole.ADMIN && !product.getProducer().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Bu ürüne erişim yetkiniz yok");
        }
        return product;
    }

    public List<Product> getProductsByProducer(User producer) {
        return productRepository.findByProducer(producer);
    }

    public List<Product> getProductsByStatus(ProductStatus status) {
        return productRepository.findByStatus(status);
    }

    public List<Product> getProductsByStatusAndUser(ProductStatus status, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return productRepository.findByStatus(status);
        }
        return productRepository.findByStatusAndProducer(status, currentUser);
    }

    public Product getProductByBatchNumber(String batchNumber) {
        return productRepository.findByBatchNumber(batchNumber)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Ürün bulunamadı"));
    }

    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setMaterial(productDetails.getMaterial());
        product.setSize(productDetails.getSize());
        product.setColor(productDetails.getColor());
        product.setStatus(productDetails.getStatus());
        
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id, User currentUser, String reason) {
        Product product = getProductByIdAndUser(id, currentUser);
        
        // Ürünü silmek yerine silindi olarak işaretle
        product.setDeleted(true);
        product.setDeletedAt(System.currentTimeMillis());
        product.setDeletedBy(currentUser);
        product.setDeleteReason(reason);
        
        // Blockchain'e silme işlemini kaydet
        ProductTransaction tx = new ProductTransaction();
        tx.setProductId(product.getId());
        tx.setAction("URUN_SILINDI");
        tx.setActorUsername(currentUser.getUsername());
        tx.setTimestamp(System.currentTimeMillis());
        tx.setPreviousState(product.getStatus().toString());
        tx.setReason(reason);
        tx.setDeleted(true);
        
        blockchainService.addTransaction(tx);
        blockchainService.minePendingTransactions();
        
        productRepository.save(product);
    }
} 