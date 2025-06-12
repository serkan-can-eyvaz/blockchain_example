package com.textile.model;

import lombok.Data;

@Data
public class ProductTransaction {
    private Long productId;
    private String action; // URUN_EKLENDI, URUN_SILINDI, URUN_GUNCELLENDI
    private String actorUsername;
    private Long timestamp;
    private String previousState; // Silme işlemi için önceki durum
    private String reason; // Silme nedeni
    private boolean isDeleted; // Silinme durumu
    private String description; // İşlem açıklaması
} 