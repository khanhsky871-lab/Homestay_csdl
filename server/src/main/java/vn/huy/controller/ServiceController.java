package vn.huy.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.huy.controller.request.ServiceCreationRequest;
import vn.huy.controller.request.ServiceGroupCreationRequest;
import vn.huy.controller.request.ServiceUpdateRequest;
import vn.huy.controller.response.ApiResponse;
import vn.huy.controller.response.ServiceResponse;
import vn.huy.model.ServiceGroup;
import vn.huy.repository.ServiceGroupRepository; // <-- Cần thiết
import vn.huy.service.ServiceService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/services")
@Slf4j(topic = "SERVICE-CONTROLLER")
@Tag(name = "Services", description = "Extra Services and groups")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceInterface;
    private final ServiceGroupRepository serviceGroupRepository; // <-- Đã inject

    @Operation(summary = "Get all services by filters")
    @GetMapping
    public Page<ServiceResponse> getAll(
            @RequestParam(required = false) Integer groupId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection
    ) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return serviceInterface.getAllPaginated(groupId, isActive, minPrice, maxPrice, pageable);
    }

    @Operation(summary = "Create new service (admin)")
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> create(@RequestBody @Valid ServiceCreationRequest request) {
        ServiceResponse response = serviceInterface.createService(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service has been created", response));
    }

    @Operation(summary = "List of service groups (Admin, Staff, Customer)")
    @GetMapping("/service-groups")
    public ResponseEntity<ApiResponse<List<ServiceGroup>>> getAllServiceGroups() {
        List<ServiceGroup> groups = serviceInterface.getAllServiceGroups();
        
        // 👇 LOG DEBUG ĐỂ XÁC NHẬN SỐ NHÓM MÀ SERVER THẤY
        System.out.println(">>> DB DEBUG: Server found " + groups.size() + " Service Groups.");
        
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Service groups", groups));
    }

    @Operation(summary = "Add service-groups (Admin)")
    @PostMapping("/service-groups")

    public ResponseEntity<ApiResponse<ServiceGroup>> addServiceGroup(
            @Valid @RequestBody ServiceGroupCreationRequest request) {
        ServiceGroup serviceGroup = serviceInterface.addServiceGroup(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Service group has been added", serviceGroup));
    }

    @Operation(summary = "Update service desired fields", description = "Duplicate names in the same group will not be updated.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(@PathVariable Long id, @RequestBody @Valid ServiceUpdateRequest request) {
        ServiceResponse response = serviceInterface.updateService(id, request);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Service has been updated", response));
    }

    @Operation(summary = "Soft delete, change status to false")
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> deleteService(@PathVariable Long id) {
        ServiceResponse response = serviceInterface.deleteService(id);
        return ResponseEntity
                .status(HttpStatus.OK)
                .body(ApiResponse.success("Service has been deleted", response));
    }


    @Operation(summary = "Delete service group")
    @DeleteMapping("/service-group/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteServiceGroup( @PathVariable Long id) {
        serviceInterface.deleteServiceGroup(id);
        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success("Service group has been deleted", null));
    }

}