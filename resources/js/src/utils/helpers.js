import secureLocalStorage from "react-secure-storage";

export const formatFullName = (firstName, middleName, lastName) => {
    const fName = firstName?.trim() || "";
    const lName = lastName?.trim() || "";
    const mName = middleName?.trim() || "";

    let fullName = fName;

    if (mName) {
        const middleInitial = mName.charAt(0).toUpperCase();
        fullName += ` ${middleInitial}.`;
    }

    fullName += ` ${lName}`;
    return fullName.trim();
};

export const getInitials = (name) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

export const getUser = () => {
    try {
        const userString = secureLocalStorage.getItem("adminpro_user");

        if (!userString) {
            console.log("No user data found in localStorage");
            return null;
        }

        const user = JSON.parse(userString);

        if (typeof user !== "object" || user === null) {
            console.error("Invalid user data format:", userString);
            return null;
        }
        return user;
    } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        secureLocalStorage.removeItem("adminpro_user");
        return null;
    }
};

export const isUserApprover = (user, group) => {


    if (!user || !user.id || !group) {
        return false;
    }


    const { approvers, } = group;
    if (!Array.isArray(approvers) || approvers.length === 0) {
        return false;
    }
   
 
    const userId = String(user.id);


    return approvers.some((approver) => {
       
        if (approver === null || approver === undefined) {
            return false;
        }

        if (typeof approver === "object" && approver.id !== undefined) {
            return approver.id.toString() === userId;
        }

        if (typeof approver === "number" || typeof approver === "string") {
            return approver.toString() === userId;
        }

        return false;
    });
};


export const isUserAdd = (user, group) => {

    if (!user?.id || !group) {
        return false;
    }

    const { approvers = [], signatories = [] } = group;
    const userId = user.id.toString();

    const isUserInList = (list) => {
        if (!Array.isArray(list)) return false;

        return list.some((item) => {
            if (item == null) return false;

            if (typeof item === "object" && item.id !== undefined) {
                return item.id.toString() === userId;
            }
            if (typeof item === "number" || typeof item === "string") {
                return item.toString() === userId;
            }

            return false;
        });
    };

    return isUserInList(approvers) || isUserInList(signatories);
};
