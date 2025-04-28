package com.zhaoxi.aihelperbackend.mapper;

import com.zhaoxi.aihelperbackend.entity.Conversation;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface ConversationMapper {
    int insert(Conversation conversation);
    Conversation findById(Long id);
    List<Conversation> findByUserId(Long userId);
    int update(Conversation conversation);
    int delete(Long id);
} 