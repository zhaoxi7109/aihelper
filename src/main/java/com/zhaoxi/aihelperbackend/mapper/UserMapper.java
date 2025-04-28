package com.zhaoxi.aihelperbackend.mapper;

import com.zhaoxi.aihelperbackend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insert(User user);
    User findByUsername(String username);
    User findByEmail(String email);
    User findByMobile(String mobile);
    User findById(Long id);
    int update(User user);
    int updatePassword(@Param("id") Long id, @Param("newPassword") String newPassword);
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
    int existsByUsername(String username);
    int existsByEmail(String email);
    int existsByMobile(String mobile);
} 