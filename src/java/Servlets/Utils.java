/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servlets;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 *
 * @author Yuval Segall
 */
public class Utils {

    public static Boolean isParamsOk(HttpServletRequest request, HttpServletResponse response, Class clas, String... params) {
        Boolean isAllGood = true;
        for (String param : params) {
            if (request.getParameter(param) == null) {
                isAllGood = false;
                break;
            }
        }
        if (isAllGood && clas.equals(Integer.class)) {
            for (String param : params) {
                try {
                    Integer.parseInt(request.getParameter(param));
                } catch (NumberFormatException ex) {
                    isAllGood = false;
                    break;
                }
            }
        }
        if (!isAllGood) {
            response.setStatus(400);
            response.setHeader("exception", "Bad Request");
        }
        return isAllGood;
    }
}
