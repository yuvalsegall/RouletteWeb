/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ws.roulette.Event;
import ws.roulette.InvalidParameters_Exception;
import ws.roulette.RouletteWebService;

/**
 *
 * @author Yuval Segall
 */
@WebServlet(name = "GetEvents", urlPatterns = {"/GetEvents"})
public class GetEvents extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Object serverObj = getServletContext().getAttribute("gameWebService");
        if (serverObj == null || !(serverObj instanceof RouletteWebService)) {
            response.setStatus(503);
            response.setHeader("exception", "Service Unavailable");
            return;
        }
        RouletteWebService server = (RouletteWebService) serverObj;
        if (!Utils.isParamsOk(request, response, Integer.class, "playerID", "eventID")) {
            return;
        }
        try {
            List<Event> events = server.getEvents(Integer.valueOf(request.getParameter("eventID")), Integer.valueOf(request.getParameter("playerID")));
            response.setContentType("application/json");
            Gson gson = new Gson();
            try (PrintWriter out = response.getWriter()) {
                out.println(gson.toJson(events));
            }
            response.setStatus(200);
        } catch (InvalidParameters_Exception ex) {
            response.setStatus(406);
            response.setHeader("exception", ex.getMessage());
        }
    }

// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
