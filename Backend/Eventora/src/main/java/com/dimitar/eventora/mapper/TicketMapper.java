package com.dimitar.eventora.mapper;

import com.dimitar.eventora.entity.TicketEntity;
import com.dimitar.eventora.model.Ticket;
import org.springframework.stereotype.Component;

@Component
public class TicketMapper {

    public Ticket toModel(TicketEntity entity) {
        if (entity == null) {
            return null;
        }

        return Ticket.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .userId(entity.getUserId())
                .qrCode(entity.getQrCode())
                .status(entity.getStatus())
                .issuedTo(entity.getIssuedTo())
                .deliveryEmail(entity.getDeliveryEmail())
                .seatSection(entity.getSeatSection())
                .seatRow(entity.getSeatRow())
                .seatNumber(entity.getSeatNumber())
                .createdAt(entity.getCreatedAt())
                .usedAt(entity.getUsedAt())
                .build();
    }
}
