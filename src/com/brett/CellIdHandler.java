package com.brett;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.geometry.S2CellId;
import com.google.common.geometry.S2LatLng;


public class CellIdHandler extends AbstractHandler
{
    public void handle(String target,Request baseRequest,HttpServletRequest request,HttpServletResponse response) 
    		throws IOException, ServletException
    {
        response.setStatus(HttpServletResponse.SC_OK);
        baseRequest.setHandled(true);

        Double lat = Double.parseDouble(request.getParameter("lat"));
        Double lng = Double.parseDouble(request.getParameter("lng"));
        
		S2CellId foundCell = S2CellId.fromLatLng(S2LatLng.fromDegrees(lat,lng)).parent(16);
		
        ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		mapper.writeValue(response.getWriter(), Long.toString(foundCell.id(),16) );
    }
}