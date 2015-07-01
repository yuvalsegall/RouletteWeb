/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servlets;

import java.io.IOException;
import java.net.URL;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ws.roulette.RouletteWebService;
import ws.roulette.RouletteWebServiceService;

/**
 *
 * @author Yuval Segall
 */
@WebServlet(name = "Configurations", urlPatterns = {"/Configurations"})
public class Configurations extends HttpServlet {

    private static RouletteWebServiceService service = null;
    private static RouletteWebService gameWebService = null;

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            URL url = new URL("http://" + request.getParameter("ip").trim() + ":" + request.getParameter("port").trim() + "/RouletteServer/RouletteWebServiceService");
            service = new RouletteWebServiceService(url);
            gameWebService = service.getRouletteWebServicePort();
            if (gameWebService == null) {
                response.setStatus(404);
                response.setHeader("exception", "Server not found");
            }
            getServletContext().setAttribute("gameWebService", gameWebService);
            response.setStatus(201);
        } catch (Exception ex) {
            response.setStatus(500);
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
