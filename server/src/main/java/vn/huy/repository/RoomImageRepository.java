package vn.huy.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.huy.controller.response.RoomImageResponse;
import vn.huy.model.RoomImage;

import java.util.List;

@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {
    void deleteByRoomId(Long roomId);

    @Query(value = "select r from RoomImage r where r.room.id =:roomId")
    List<RoomImage> findAllByRoomId(Long roomId);

    boolean existsByRoomId(Long roomId);
}
