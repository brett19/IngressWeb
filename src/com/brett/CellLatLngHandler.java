package com.brett;

import java.io.IOException;
import java.math.BigInteger;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.geometry.S2CellId;
import com.google.common.geometry.S2LatLng;

public class CellLatLngHandler extends AbstractHandler {
    public void handle(String target,Request baseRequest,HttpServletRequest request,HttpServletResponse response) 
    		throws IOException, ServletException
    {
        response.setStatus(HttpServletResponse.SC_OK);
        baseRequest.setHandled(true);

        Long cellId = new BigInteger(request.getParameter("cellid"),16).longValue();
		S2CellId foundCell = new S2CellId(cellId);
		S2LatLng foundLatLng = foundCell.toLatLng();
		
        ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		mapper.writeValue(response.getWriter(), Double.toString(foundLatLng.lat().degrees()) + "," + Double.toString(foundLatLng.lng().degrees()) );
    }
}
