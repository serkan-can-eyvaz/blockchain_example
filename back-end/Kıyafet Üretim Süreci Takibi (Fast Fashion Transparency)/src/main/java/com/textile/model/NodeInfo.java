package com.textile.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NodeInfo {
    private String nodeId;
    private int blockCount;
    private String peers;
} 