package com.resqlink.api.config;

import com.resqlink.api.security.JwtService;
import com.resqlink.api.user.User;
import com.resqlink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${resqlink.security.cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/ws")
                .setAllowedOrigins(allowedOrigins.split(","))
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {

            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                var accessor = MessageHeaderAccessor.getAccessor(message,
                        org.springframework.messaging.simp.stomp.StompHeaderAccessor.class);

                if (accessor != null
                        && org.springframework.messaging.simp.stomp.StompCommand.CONNECT
                        .equals(accessor.getCommand())) {

                    String auth = accessor.getFirstNativeHeader("Authorization");
                    if (auth != null && auth.startsWith("Bearer ")) {
                        String token = auth.substring(7);
                        var claims = jwtService.parseClaims(token);

                        if (jwtService.isAccessToken(claims)) {
                            String email = jwtService.extractUsername(claims);
                            User user = userRepository.findByEmail(email)
                                    .orElseThrow(() -> new UsernameNotFoundException(
                                            "User not found: " + email));

                            var authentication = new UsernamePasswordAuthenticationToken(
                                    user, null, user.getAuthorities());
                            accessor.setUser(authentication);
                            accessor.getSessionAttributes()
                                    .put("user", user);
                        }
                    }
                }

                return message;
            }
        });
    }
}
