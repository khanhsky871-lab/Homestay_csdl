package vn.huy.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.huy.common.RoomStatus;
import vn.huy.common.RoomType;
import vn.huy.controller.request.RoomCreationRequest;
import vn.huy.controller.request.RoomImageRequest;
import vn.huy.controller.request.RoomUpdateRequest;
import vn.huy.controller.response.RoomImageResponse;
import vn.huy.controller.response.RoomResponse;
import vn.huy.controller.response.RoomStatusHistoryResponse;
import vn.huy.model.Room;
import vn.huy.model.RoomStatusHistory;

import java.math.BigDecimal;
import java.util.List;

public interface RoomService {

    Page<RoomResponse> filterRooms(RoomType type,
                                   RoomStatus status,
                                   Integer capacity,
                                   BigDecimal minPrice,
                                   BigDecimal maxPrice,
                                   Pageable pageable);

    RoomResponse createRoom(RoomCreationRequest room);

    RoomResponse findRoomById(Long id);

    RoomResponse update(Long id, RoomUpdateRequest request);

    void deleteRoomById(Long id);

    List<RoomImageResponse> roomImageList(Long roomId);

    List<RoomImageResponse> uploadImage(Long roomId, RoomImageRequest imageUrl);

    List<RoomStatusHistoryResponse> getRoomStatusHistory(Long roomId);
}
