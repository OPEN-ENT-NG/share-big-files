/*
 * Copyright © Conseil Régional Nord Pas de Calais - Picardie, 2016.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */

package fr.openent.sharebigfiles.utils;

import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by dbreyton on 17/02/2016.
 */
public final class DateUtils {
    private static final String DEFAULT_DATE_PATTERN = "dd/MM/yyyy";

    private DateUtils()  {}

    public static String format(Date d, String pattern) {
        if (d == null) {
            return null;
        }
        final String myPattern = (pattern != null) ? pattern : DEFAULT_DATE_PATTERN;
        return new SimpleDateFormat(myPattern).format(d);
    }

    public static String format(Date d) {
        return format(d, DEFAULT_DATE_PATTERN);
    }
}
