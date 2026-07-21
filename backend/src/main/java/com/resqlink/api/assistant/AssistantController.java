package com.resqlink.api.assistant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantEngine assistantEngine;

    public record ChatRequest(
            @NotBlank(message = "Message is required")
            @Size(max = 1000, message = "Message is too long")
            String message
    ) {
    }

    public record ChatResponse(String reply, List<String> suggestions, String disclaimer) {
    }

    @PostMapping("/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        AssistantEngine.AssistantAnswer answer = assistantEngine.answer(request.message());
        return new ChatResponse(
                answer.reply(),
                answer.suggestions(),
                "AI assistance does not replace professional medical advice. In a life-threatening emergency always call 112 first."
        );
    }
}
