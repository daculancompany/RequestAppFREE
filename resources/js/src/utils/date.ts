import { format, formatDistanceToNow, parseISO } from "date-fns";

export const formatDate = (dateString: string, formatStr: string = "PPpp") => {
    try {
        return format(parseISO(dateString), formatStr);
    } catch (error) {
        return "Invalid date";
    }
};

export const formatRelativeTime = (dateString: string) => {
    try {
        return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
        return "";
    }
};
