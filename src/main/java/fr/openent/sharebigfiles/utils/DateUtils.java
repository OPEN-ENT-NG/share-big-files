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
