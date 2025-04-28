package com.zhaoxi.aihelperbackend.mapper;

import com.zhaoxi.aihelperbackend.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface MessageMapper {
    int insert(Message message);
    Message findById(Long id);
    List<Message> findByConversationId(Long conversationId);
    int update(Message message);
    int deleteByConversationId(Long conversationId);
    int deleteById(Long id);
}