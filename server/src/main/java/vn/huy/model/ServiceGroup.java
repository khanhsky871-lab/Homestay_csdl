package vn.huy.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "servicegroup")
public class ServiceGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    // 👇 SỬA "group" THÀNH "serviceGroup" (Để khớp với biến bên ServiceEntity)
    @OneToMany(mappedBy = "serviceGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceEntity> services = new ArrayList<>();
    
    // Thêm cột description nếu database có (để tránh lỗi)
    @Column(name = "description") 
    private String description;
}