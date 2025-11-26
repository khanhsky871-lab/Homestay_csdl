package vn.huy.controller.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class RoomImageRequest {
    @NotEmpty(message = "images cannot be empty")
    private List<String> imageUrl;
}
