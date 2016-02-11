package fr.openent.sharebigfiles.services;

import com.fasterxml.jackson.databind.util.ISO8601DateFormat;

import java.text.ParseException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;

/**
 * Created by dbreyton on 09/02/2016.
 */
public final class DateUtils {

    private DateUtils()  {}

    public static Date add(Date date, int field, int value) {
        if (date != null) {
            final Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            cal.add(field, value);
            return cal.getTime();
        }

        return null;
    }

    public static Boolean lessOrEquals(Date d1, Date d2) {
        if ((d1 == null) || (d2 == null)) {
            return false;
        }
        final Date d1Arr = untimed(d1);
        final Date d2Arr = untimed(d2);
        return (d1Arr.before(d2) || d1Arr.equals(d2Arr));
    }

    private static Date untimed(Date date) {
        final Calendar cal = new GregorianCalendar();
        cal.setTime(date);
        cal.set(Calendar.HOUR_OF_DAY, 0);

        return cal.getTime();
    }

    public static Date dateFromISO8601(String d1) throws ParseException {
        if (d1 != null && !d1.isEmpty()) {
            final ISO8601DateFormat df = new ISO8601DateFormat();
            return df.parse(d1);
        }
        return null;
    }
}
