package com.studypilot.service;

import com.studypilot.dto.*;
import com.studypilot.entity.Role;
import com.studypilot.entity.User;
import com.studypilot.repository.RoleRepository;
import com.studypilot.repository.UserRepository;
import com.studypilot.security.JwtUtils;
import com.studypilot.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtils jwtUtils;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEnabled(true);

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException(
                        "ROLE_USER not found in the database. " +
                                "Make sure the application started with roles initialized. " +
                                "Check DataInitializer or run the application fresh."));
        roles.add(userRole);
        user.setRoles(roles);
        userRepository.save(user);

        /*
         * FIX (Bug 3): Removed double-brace anonymous class initialization.
         *
         * OLD CODE (broken):
         *   return login(new LoginRequest() {{
         *       setUsername(request.getUsername());
         *       setPassword(request.getPassword());
         *   }});
         *
         * WHY IT'S BROKEN:
         *   new LoginRequest() {{ ... }} creates an ANONYMOUS SUBCLASS of LoginRequest.
         *   Anonymous inner classes capture a reference to their enclosing instance,
         *   preventing garbage collection (memory leak). They also cause issues with
         *   serialization frameworks and are considered an anti-pattern.
         *
         * FIX: Create a plain LoginRequest object using explicit setter calls.
         */
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setUsername(request.getUsername());
        loginRequest.setPassword(request.getPassword());
        return login(loginRequest);
    }

    public AuthResponse login(LoginRequest request) {

        try {

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails =
                    (UserDetailsImpl) authentication.getPrincipal();

            List<String> roles = userDetails.getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());

            return
                    new AuthResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    "",
                    roles
);

        } catch (Exception e) {
            System.out.println("Authentication Exception:");
            e.printStackTrace();
            throw e;
        }
    }
}