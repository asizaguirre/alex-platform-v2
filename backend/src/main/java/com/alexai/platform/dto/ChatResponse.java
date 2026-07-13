package com.alexai.platform.dto;


public class ChatResponse {


    private String agent;

    private String response;


    public ChatResponse(
            String agent,
            String response
    ){

        this.agent = agent;
        this.response = response;

    }


    public String getAgent(){

        return agent;

    }


    public String getResponse(){

        return response;

    }

}
