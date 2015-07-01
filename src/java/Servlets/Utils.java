package Servlets;


import javax.servlet.http.HttpServletRequest;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 *
 * @author Yuval Segall
 */
public class Utils {

    public static Boolean isParamsOk(HttpServletRequest request, String... params) {
        for (String param : params) {
            if (request.getParameter(param) == null) {
                return false;
            }
        }
        return true;
    }
}
