package com.brett;

import java.util.LinkedHashMap;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProxyResponse {
	@JsonProperty
	public LinkedHashMap<String,String> cookies = new LinkedHashMap<String,String>();
	
	@JsonProperty
	public int statusCode = 0;
	
	@JsonProperty
	public String body = "";
}
