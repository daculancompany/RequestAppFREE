
import { getUser } from "@/utils/helpers";

const UserRoleDisplay = ({ group }) => { 
    const user = getUser();
    const userId = user?.id;

    const roles = [];

    if (userId && group) {
        // Helper function to check if user is in a role array
        const checkRole = (array) => {
            if (!Array.isArray(array)) return false;

            return array.some((item) => {
                const itemId = typeof item === "object" ? item?.id : item;
                return String(itemId) === String(userId);
            });
        };

        // Check each role type
        if (checkRole(group.members)) {
            roles.push("Member");
        }
        if (checkRole(group.approvers)) {
            roles.push("Approver");
        }
        if (checkRole(group.signatories)) {
            roles.push("Signatory");
        }
    }

    console.log(group.members)
    console.log({userId})
    const roleText =
        roles.length > 0
            ? `You are ${roles.join(", ")} of this group`
            : "You are not a member of this group";

    return (
        <div className="role-display-container">
            <span className="you-are">{roleText}</span>
        </div>
    );
};

export default UserRoleDisplay;