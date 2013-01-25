package com.brett;

import java.util.LinkedHashMap;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProxyRequest {
	@JsonProperty
	public LinkedHashMap<String,String> cookies = new LinkedHashMap<String,String>();
	
	@JsonProperty
	public String xsrfToken;
	
	@JsonProperty
	public String contentType;
	
	@JsonProperty
	public String method;
	
	@JsonProperty
	public String url;
	
	@JsonProperty
	public String body;
	
	@JsonProperty
	public LinkedHashMap<String,String> headers;
}
