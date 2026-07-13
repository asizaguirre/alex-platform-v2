package com.alexai.platform.controller;


import com.alexai.platform.dto.ChatRequest;
import com.alexai.platform.dto.ChatResponse;
import com.alexai.platform.service.AgentService;


import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api")
@CrossOrigin
public class AgentController {



    private final AgentService service;



    public AgentController(
            AgentService service
    ){

        this.service = service;

    }



    @PostMapping("/chat")
    public ChatResponse chat(
            @RequestBody ChatRequest request
    ){

        return service.execute(request);

    }


}
