package com.dimitar.eventora.dto;

import com.dimitar.eventora.model.Genre;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestDTO {
    private String name;
    private String description;
    private LocalDateTime eventDate;
    private Genre genre;
    private BigDecimal ticketPrice;
    private Integer maxTickets;
    private String imageUrl;
    private Long organizerId;
}
