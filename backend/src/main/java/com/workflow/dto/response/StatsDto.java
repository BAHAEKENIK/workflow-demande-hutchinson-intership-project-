package com.workflow.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsDto {
    private long pending;
    private long approved;
    private long rejected;
}