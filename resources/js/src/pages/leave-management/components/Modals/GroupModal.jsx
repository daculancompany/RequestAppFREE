import React, { useState, useEffect, useMemo } from "react";
import {
    Drawer,
    Form,
    Input,
    Select,
    ColorPicker,
    Button,
    Row,
    Col,
    Divider,
    Upload,
    Avatar,
    Space,
    Card,
    Tag,
    message,
    Tooltip,
    Tabs,
    Typography,
    Badge,
    Progress,
    Alert,
    Grid,
    Empty,
    Pagination,
    Spin,
} from "antd";
import {
    TeamOutlined,
    UploadOutlined,
    PictureOutlined,
    DeleteOutlined,
    EyeOutlined,
    AppstoreOutlined,
    CodeOutlined,
    ExperimentOutlined,
    SafetyOutlined,
    UserOutlined,
    SearchOutlined,
    MailOutlined,
    ApartmentOutlined,
    CheckCircleFilled,
    UserSwitchOutlined,
    FileDoneOutlined,
    SignatureOutlined,
    CrownOutlined,
    CrownFilled,
    RocketOutlined,
    CheckCircleOutlined,
    UserAddOutlined,
    FileImageOutlined,
    PlusOutlined,
    MinusOutlined,
    UsergroupAddOutlined,
    IdcardOutlined,
    StarFilled,
    EditOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { IoColorPaletteOutline } from "react-icons/io5";
import "@/styles/GroupModal.scss";
import { useMembers } from "@/hooks/queries/members.queries";
import {
    useCreateGroupMutation,
    useUpdateGroupMutation,
} from "@/hooks/queries/group.queries";
import { useGlobalStore } from "@/stores/global.store";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Text } = Typography;
const { useBreakpoint } = Grid;

// Employee card component (unchanged)
const EmployeeCard = ({
    employee,
    isSelected = false,
    onClick,
    type = "approver",
    isMobile,
    selectedColor,
    isDefault = false,
}) => {
    const handleCardClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(employee.id);
    };

    const getBorderColor = () => {
        switch (type) {
            case "signatory":
                return "#FA8C16";
            case "member":
                return "#52C41A";
            default:
                return selectedColor;
        }
    };

    const getIcon = () => {
        if (!isSelected) return null;
        switch (type) {
            case "signatory":
                return (
                    <SignatureOutlined
                        style={{
                            color: "#FA8C16",
                            marginLeft: "8px",
                            fontSize: "14px",
                        }}
                    />
                );
            case "member":
                return (
                    <CheckCircleFilled
                        style={{
                            color: "#52C41A",
                            marginLeft: "8px",
                            fontSize: "14px",
                        }}
                    />
                );
            default:
                return (
                    <CheckCircleFilled
                        style={{
                            color: selectedColor,
                            marginLeft: "8px",
                            fontSize: "14px",
                        }}
                    />
                );
        }
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`employee-card ${isSelected ? "selected" : ""} ${isDefault ? "default-user" : ""}`}
            onClick={handleCardClick}
            style={{ cursor: "pointer" }}
        >
            <Avatar
                size={isMobile ? 40 : 48}
                src={employee.avatar}
                icon={<UserOutlined />}
                style={{
                    border: `2px solid ${isSelected ? getBorderColor() : "#e8e8e8"}`,
                    transition: "all 0.3s ease",
                }}
            />
            <div className="employee-info">
                <div className="employee-header">
                    <h4 className="employee-name">
                        {employee.name}
                        {isDefault && (
                            <Tooltip title="You (Default)">
                                <StarFilled
                                    style={{
                                        color: "#FFD700",
                                        marginLeft: "8px",
                                        fontSize: "14px",
                                    }}
                                />
                            </Tooltip>
                        )}
                        {isSelected && !isDefault && getIcon()}
                    </h4>
                    {type === "signatory" && isSelected && (
                        <Tag
                            color="gold"
                            icon={<SignatureOutlined />}
                            style={{ fontSize: "10px", marginLeft: "8px" }}
                        >
                            Signatory
                        </Tag>
                    )}
                    {type === "member" && isSelected && (
                        <Tag
                            color="green"
                            icon={<UserOutlined />}
                            style={{ fontSize: "10px", marginLeft: "8px" }}
                        >
                            Member
                        </Tag>
                    )}
                </div>
                <p className="employee-position">{employee.position}</p>
                <div className="employee-meta">
                    <Tag size="small" icon={<ApartmentOutlined />}>
                        {employee.department}
                    </Tag>
                    <Tag size="small" icon={<MailOutlined />}>
                        {employee.email.split("@")[0]}
                    </Tag>
                    {type === "signatory" && employee.signature && (
                        <Tooltip title="Has digital signature">
                            <Tag
                                size="small"
                                color="green"
                                icon={<FileDoneOutlined />}
                            >
                                Signed
                            </Tag>
                        </Tooltip>
                    )}
                    {isDefault && (
                        <Tag
                            size="small"
                            color="gold"
                            icon={<StarFilled />}
                            style={{ fontSize: "10px" }}
                        >
                            You
                        </Tag>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const GroupDrawer = () => {
    const createGroupMutation = useCreateGroupMutation();
    const updateGroupMutation = useUpdateGroupMutation();
    const { newGroup, setNewGroup, groupSelected, setGroupSelected } =
        useGlobalStore();

    const {
        data: { data: members = [] } = {},
        isLoading: isLoadingMembers,
        error: membersError,
        refetch: refetchMembers,
    } = useMembers();

    const { transformedMembers, currentUserId } = useMemo(() => {
        if (!members || !Array.isArray(members))
            return { transformedMembers: [], currentUserId: null };

        const transformed = members.map((member) => ({
            id: member.id?.toString() || "",
            name:
                member.name ||
                `${member.fname || ""} ${member.lname || ""}`.trim() ||
                "Unknown User",
            position:
                member.position?.position || member.position || "No Position",
            department:
                member.department?.department ||
                member.department ||
                "No Department",
            avatar: member.avatar || null,
            email: member.email || "no-email@example.com",
            phone: member.phone || "N/A",
            signature: member.esignature || null,
            address: member.address,
            branch_id: member.branch_id,
            role: member.role,
            status: member.status,
            is_you: member.is_you || false,
        }));

        const currentUser = transformed.find((member) => member.is_you);
        const currentUserId = parseInt(currentUser?.id) || null;

        return { transformedMembers: transformed, currentUserId };
    }, [members]);

    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState("basic");
    const [selectedColor, setSelectedColor] = useState("#1890ff");
    const [coverImage, setCoverImage] = useState(null);
    const [coverImagePreview, setCoverImagePreview] = useState(null);
    const [templateMode, setTemplateMode] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const [selectedApprovers, setSelectedApprovers] = useState([]);
    const [selectedSignatories, setSelectedSignatories] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);

    const [searchValue, setSearchValue] = useState("");
    const [searchSignatoryValue, setSearchSignatoryValue] = useState("");
    const [searchMemberValue, setSearchMemberValue] = useState("");
    const [activeCollapses, setActiveCollapses] = useState({
        approvers: false,
        signatories: false,
        members: true,
    });

    const [currentApproverPage, setCurrentApproverPage] = useState(1);
    const [currentSignatoryPage, setCurrentSignatoryPage] = useState(1);
    const [currentMemberPage, setCurrentMemberPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const isTablet = screens.md && !screens.lg;

    const groupTemplates = [
        {
            id: "dev-team",
            name: "Development Team",
            description: "Standard setup for software engineering teams",
            color: "#1890ff",
            icon: <CodeOutlined />,
            coverImage:
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop",
            approvers: [],
            signatories: [],
            settings: {
                autoApprove: false,
                maxLeaveDuration: 15,
            },
            tags: ["Engineering", "Tech", "Development"],
            stats: { members: 12, active: 10, capacity: 15 },
        },
        {
            id: "design-team",
            name: "Design Team",
            description: "Creative team with flexible leave policies",
            color: "#52c41a",
            icon: <ExperimentOutlined />,
            coverImage:
                "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&h=400&fit=crop",
            approvers: [],
            signatories: [],
            settings: {
                autoApprove: true,
                maxLeaveDuration: 20,
            },
            tags: ["Design", "Creative", "UI/UX"],
            stats: { members: 8, active: 7, capacity: 12 },
        },
        {
            id: "hr-department",
            name: "HR Department",
            description: "Human resources management team",
            color: "#722ed1",
            icon: <TeamOutlined />,
            coverImage:
                "https://images.unsplash.com/photo-1551836026-d5c2c2c7b3c9?w=1200&h=400&fit=crop",
            approvers: [],
            signatories: [],
            settings: {
                autoApprove: false,
                maxLeaveDuration: 30,
            },
            tags: ["HR", "Management", "People"],
            stats: { members: 6, active: 5, capacity: 8 },
        },
        {
            id: "qa-team",
            name: "QA Team",
            description: "Quality assurance and testing",
            color: "#fa8c16",
            icon: <SafetyOutlined />,
            coverImage:
                "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop",
            approvers: [],
            signatories: [],
            settings: {
                autoApprove: false,
                maxLeaveDuration: 10,
            },
            tags: ["Testing", "Quality", "QA"],
            stats: { members: 10, active: 9, capacity: 12 },
        },
    ];

    const colorOptions = [
        { color: "#1890ff", name: "Ocean Blue" },
        { color: "#52c41a", name: "Emerald Green" },
        { color: "#fa8c16", name: "Sunset Orange" },
        { color: "#722ed1", name: "Royal Purple" },
        { color: "#eb2f96", name: "Magenta Pink" },
        { color: "#13c2c2", name: "Cyan Teal" },
        { color: "#f5222d", name: "Ruby Red" },
        { color: "#faad14", name: "Gold Yellow" },
        { color: "#a0d911", name: "Lime Green" },
        { color: "#7cb305", name: "Forest Green" },
        { color: "#08979c", name: "Deep Teal" },
        { color: "#0050b3", name: "Navy Blue" },
        { color: "#531dab", name: "Dark Purple" },
        { color: "#c41d7f", name: "Deep Pink" },
        { color: "#d4380d", name: "Volcano Red" },
    ];

    useEffect(() => {
        if (groupSelected && groupSelected.id) {
            setIsEditMode(true);
        } else {
            setIsEditMode(false);
        }
    }, [groupSelected]);

    useEffect(() => {
        if (
            groupSelected &&
            groupSelected.id &&
            transformedMembers.length > 0
        ) {
            // Set form values
            form.setFieldsValue({
                name: groupSelected.group_name,
                code: groupSelected.group_code,
                description: groupSelected.description || "",
                capacity: 50,
                maxLeaveDuration:
                    groupSelected.settings?.maxLeaveDuration || 30,
                autoApprove: groupSelected.settings?.autoApprove || false,
                tags: groupSelected.tags?.join(", ") || "",
            });

            // Set color
            setSelectedColor(groupSelected.group_color || "#1890ff");

            // Set cover image preview
            if (groupSelected.group_image) {
                setCoverImagePreview(groupSelected.group_image);
            }

            // Map member IDs to transformed members
            if (groupSelected.members && groupSelected.members.length > 0) {
                const memberIds = groupSelected.members.map((m) =>
                    m.id.toString(),
                );
                const selectedMemberObjs = transformedMembers.filter((m) =>
                    memberIds.includes(m.id),
                );
                setSelectedMembers(selectedMemberObjs);
                form.setFieldsValue({
                    members: selectedMemberObjs.map((m) => m.id),
                });
            }

            // Map approvers
            if (groupSelected.approvers && groupSelected.approvers.length > 0) {
                const approverIds = groupSelected.approvers.map((a) =>
                    a.id.toString(),
                );
                const selectedApproverObjs = transformedMembers.filter((m) =>
                    approverIds.includes(m.id),
                );
                setSelectedApprovers(selectedApproverObjs);
                form.setFieldsValue({
                    approvers: selectedApproverObjs.map((a) => a.id),
                });
            }

            // Map signatories
            if (
                groupSelected.signatories &&
                groupSelected.signatories.length > 0
            ) {
                const signatoryIds = groupSelected.signatories.map((s) =>
                    s.id.toString(),
                );
                const selectedSignatoryObjs = transformedMembers.filter((m) =>
                    signatoryIds.includes(m.id),
                );
                setSelectedSignatories(selectedSignatoryObjs);
                form.setFieldsValue({
                    signatories: selectedSignatoryObjs.map((s) => s.id),
                });
            }

            setInitialized(true);
        }
    }, [groupSelected, transformedMembers, form]);

    // Initialize default user as member and approver (only for create mode)
    useEffect(() => {
        if (
            !isEditMode &&
            newGroup &&
            currentUserId &&
            transformedMembers.length > 0 &&
            !initialized
        ) {
            const defaultUser = transformedMembers.find(
                (member) => parseInt(member.id) === currentUserId,
            );

            if (defaultUser) {
                console.log("Initializing default user:", defaultUser);

                const updatedMembers = [defaultUser];
                form.setFieldsValue({
                    members: updatedMembers.map((member) => member.id),
                });
                setSelectedMembers(updatedMembers);

                const updatedApprovers = [defaultUser];
                form.setFieldsValue({
                    approvers: updatedApprovers.map((member) => member.id),
                });
                setSelectedApprovers(updatedApprovers);

                setInitialized(true);

                message.info({
                    content: (
                        <div>
                            <StarFilled
                                style={{ color: "#FFD700", marginRight: 8 }}
                            />
                            You have been automatically added as a member and
                            approver
                        </div>
                    ),
                    duration: 3,
                });
            }
        }
    }, [
        isEditMode,
        newGroup,
        currentUserId,
        transformedMembers,
        initialized,
        form,
    ]);

    // Reset when drawer closes
    useEffect(() => {
        if (!newGroup && !groupSelected) {
            setInitialized(false);
            setSelectedMembers([]);
            setSelectedApprovers([]);
            setSelectedSignatories([]);
            setCoverImage(null);
            setCoverImagePreview(null);
            setSelectedColor("#1890ff");
            setActiveTab("basic");
            setTemplateMode(false);
            setSelectedTemplate(null);
            setSearchValue("");
            setSearchSignatoryValue("");
            setSearchMemberValue("");
            setActiveCollapses({
                approvers: false,
                signatories: false,
                members: true,
            });
            setCurrentApproverPage(1);
            setCurrentSignatoryPage(1);
            setCurrentMemberPage(1);
            setPageSize(6);
            form.resetFields();
            setIsEditMode(false);
        }
    }, [newGroup, groupSelected, form]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        // For templates, we'll select the first few members as approvers/signatories/members
        const templateApprovers = transformedMembers.slice(0, 2);
        const templateSignatories = transformedMembers.slice(2, 3);
        const templateMembers = transformedMembers.slice(3, 8);

        form.setFieldsValue({
            name: template.name,
            description: template.description,
            color: template.color,
            tags: template.tags.join(", "),
            approvers: templateApprovers.map((emp) => emp.id),
            signatories: templateSignatories.map((emp) => emp.id),
            members: templateMembers.map((emp) => emp.id),
            maxLeaveDuration: template.settings.maxLeaveDuration,
            autoApprove: template.settings.autoApprove,
        });
        setSelectedColor(template.color);
        setSelectedApprovers(templateApprovers);
        setSelectedSignatories(templateSignatories);
        setSelectedMembers(templateMembers);
        if (template.coverImage) {
            setCoverImagePreview(template.coverImage);
        }
        message.success(`Template "${template.name}" loaded`);
    };

    const handleCoverImageUpload = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setCoverImage(file);
            setCoverImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        return false;
    };

    const removeCoverImage = () => {
        setCoverImage(null);
        setCoverImagePreview(null);
    };

    // Handle approver selection
    const handleApproverSelect = (employeeId) => {
        const employee = transformedMembers.find(
            (emp) => emp.id === employeeId,
        );
        if (!employee) return;

        // Check if this is the default user
        if (employee.is_you) {
            message.warning("You cannot remove yourself as an approver");
            return;
        }

        setSelectedApprovers((prev) => {
            const isAlreadySelected = prev.find((emp) => emp.id === employeeId);
            if (isAlreadySelected) {
                const newApprovers = prev.filter(
                    (emp) => emp.id !== employeeId,
                );
                form.setFieldsValue({
                    approvers: newApprovers.map((emp) => emp.id),
                });
                return newApprovers;
            } else {
                const newApprovers = [...prev, employee];
                form.setFieldsValue({
                    approvers: newApprovers.map((emp) => emp.id),
                });
                return newApprovers;
            }
        });
    };

    // Handle signatory selection
    const handleSignatorySelect = (employeeId) => {
        const employee = transformedMembers.find(
            (emp) => emp.id === employeeId,
        );
        if (!employee) return;

        setSelectedSignatories((prev) => {
            const isAlreadySelected = prev.find((emp) => emp.id === employeeId);
            if (isAlreadySelected) {
                const newSignatories = prev.filter(
                    (emp) => emp.id !== employeeId,
                );
                form.setFieldsValue({
                    signatories: newSignatories.map((emp) => emp.id),
                });
                return newSignatories;
            } else {
                const newSignatories = [...prev, employee];
                form.setFieldsValue({
                    signatories: newSignatories.map((emp) => emp.id),
                });
                return newSignatories;
            }
        });
    };

    // Handle member selection
    const handleMemberSelect = (employeeId) => {
        const employee = transformedMembers.find(
            (emp) => emp.id === employeeId,
        );
        if (!employee) return;

        // Prevent deselecting the default user (you)
        if (employee.is_you) {
            message.warning("You cannot remove yourself as a member");
            return;
        }

        setSelectedMembers((prev) => {
            const isAlreadySelected = prev.find((emp) => emp.id === employeeId);
            if (isAlreadySelected) {
                const newMembers = prev.filter((emp) => emp.id !== employeeId);
                form.setFieldsValue({
                    members: newMembers.map((emp) => emp.id),
                });
                return newMembers;
            } else {
                const newMembers = [...prev, employee];
                form.setFieldsValue({
                    members: newMembers.map((emp) => emp.id),
                });
                return newMembers;
            }
        });
    };

    // Select all members
    const handleSelectAllMembers = () => {
        if (selectedMembers.length === transformedMembers.length) {
            // Deselect all except default user
            const defaultUser = transformedMembers.find(
                (member) => member.is_you,
            );
            setSelectedMembers(defaultUser ? [defaultUser] : []);
            form.setFieldsValue({
                members: defaultUser ? [defaultUser.id] : [],
            });
        } else {
            // Select all
            setSelectedMembers([...transformedMembers]);
            form.setFieldsValue({
                members: transformedMembers.map((emp) => emp.id),
            });
        }
    };

    // Search filter for approvers with pagination
    const filteredApprovers = useMemo(() => {
        return transformedMembers.filter(
            (emp) =>
                emp.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                emp.position
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()) ||
                emp.department
                    .toLowerCase()
                    .includes(searchValue.toLowerCase()),
        );
    }, [searchValue, transformedMembers]);

    // Search filter for signatories with pagination
    const filteredSignatories = useMemo(() => {
        return transformedMembers.filter(
            (emp) =>
                emp.name
                    .toLowerCase()
                    .includes(searchSignatoryValue.toLowerCase()) ||
                emp.position
                    .toLowerCase()
                    .includes(searchSignatoryValue.toLowerCase()) ||
                emp.department
                    .toLowerCase()
                    .includes(searchSignatoryValue.toLowerCase()),
        );
    }, [searchSignatoryValue, transformedMembers]);

    // Search filter for members with pagination
    const filteredMembers = useMemo(() => {
        return transformedMembers.filter(
            (emp) =>
                emp.name
                    .toLowerCase()
                    .includes(searchMemberValue.toLowerCase()) ||
                emp.position
                    .toLowerCase()
                    .includes(searchMemberValue.toLowerCase()) ||
                emp.department
                    .toLowerCase()
                    .includes(searchMemberValue.toLowerCase()),
        );
    }, [searchMemberValue, transformedMembers]);

    // Get paginated data for approvers
    const paginatedApprovers = useMemo(() => {
        const startIndex = (currentApproverPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredApprovers.slice(startIndex, endIndex);
    }, [filteredApprovers, currentApproverPage, pageSize]);

    // Get paginated data for signatories
    const paginatedSignatories = useMemo(() => {
        const startIndex = (currentSignatoryPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredSignatories.slice(startIndex, endIndex);
    }, [filteredSignatories, currentSignatoryPage, pageSize]);

    // Get paginated data for members
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentMemberPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredMembers.slice(startIndex, endIndex);
    }, [filteredMembers, currentMemberPage, pageSize]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();

            // Append basic form values
            formData.append("name", values.name || "");
            formData.append("code", values.code || "");
            formData.append("description", values.description || "");
            formData.append("color", selectedColor);
            formData.append("createdAt", new Date().toISOString());
            formData.append("createdBy", "You");
            formData.append("capacity", parseInt(values.capacity) || 50);

            // Append arrays as JSON strings
            formData.append("approvers", JSON.stringify(selectedApprovers));
            formData.append("signatories", JSON.stringify(selectedSignatories));
            formData.append("members", JSON.stringify(selectedMembers));

            // Append cover image if exists (new file)
            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            // Append other fields
            if (values.tags) formData.append("tags", values.tags);
            if (values.maxLeaveDuration)
                formData.append("maxLeaveDuration", values.maxLeaveDuration);
            if (values.autoApprove)
                formData.append("autoApprove", values.autoApprove);

            if (isEditMode && groupSelected) {
                // Update existing group
                const response = await updateGroupMutation.mutateAsync({
                    id: groupSelected.id,
                    formData,
                });

                message.success("Group updated successfully!");
                if (
                    useGlobalStore.getState().activeGroup?.id ===
                    groupSelected.id
                ) {
                    // If response contains updated group data
                    const updatedGroup = response?.data || response;
                    useGlobalStore.getState().setActiveGroup(updatedGroup);
                }
            } else {
                // Create new group
                await createGroupMutation.mutateAsync(formData);
                message.success("Group created successfully!");
            }

            setTimeout(() => {
                setNewGroup(false);
                setGroupSelected(null);
                if (!isEditMode) {
                    window.location.reload();
                }
            }, 2000);
        } catch (error) {
            console.error("Group operation failed:", error);
            message.error(
                error.response?.data?.message ||
                    `Failed to ${isEditMode ? "update" : "create"} group`,
            );
        } finally {
            setLoading(false);
        }
    };

    // Handle drawer close
    const handleClose = () => {
        setNewGroup(false);
        setGroupSelected(null);
    };

    const handleColorChange = (color) => {
        setSelectedColor(color.toHexString());
    };

    const gradientStyle = `linear-gradient(135deg, ${selectedColor}40 0%, ${selectedColor}20 100%)`;

    const toggleCollapse = (key) => {
        setActiveCollapses((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Custom collapse header
    const CollapseHeader = ({
        title,
        count,
        icon,
        isOpen,
        color,
        extraAction,
    }) => {
        return (
            <div className="collapse-header">
                <div className="collapse-title">
                    {icon}
                    <span style={{ marginLeft: "8px", fontWeight: 600 }}>
                        {title}
                    </span>
                    <Badge
                        count={count}
                        style={{
                            backgroundColor: color,
                            marginLeft: "12px",
                        }}
                    />
                </div>
                <div className="collapse-right-section">
                    {extraAction && (
                        <div
                            className="extra-action"
                            onClick={(e) => {
                                e.stopPropagation();
                                extraAction.onClick();
                            }}
                        >
                            {extraAction.icon}
                            <span
                                style={{ marginLeft: "4px", fontSize: "12px" }}
                            >
                                {extraAction.text}
                            </span>
                        </div>
                    )}
                    <div className="collapse-arrow">
                        {isOpen ? <MinusOutlined /> : <PlusOutlined />}
                    </div>
                </div>
            </div>
        );
    };

    // Responsive drawer configuration
    const getDrawerWidth = () => {
        if (isMobile) {
            return "100%";
        } else if (isTablet) {
            return "90vw";
        } else {
            return 1200;
        }
    };

    // Responsive columns
    const getFormLayout = () => {
        if (isMobile) {
            return { formCol: 24, previewCol: 24 };
        } else if (isTablet) {
            return { formCol: 24, previewCol: 24 };
        } else {
            return { formCol: 16, previewCol: 8 };
        }
    };

    const handleFormFailed = ({ errorFields }) => {
        if (errorFields.length > 0) {
            message.error({
                content: (
                    <div>
                        <div
                            style={{
                                fontWeight: "bold",
                                marginBottom: "8px",
                            }}
                        >
                            Please fix the following errors:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {errorFields.slice(0, 3).map((field, index) => (
                                <li key={index}>{field.errors[0]}</li>
                            ))}
                            {errorFields.length > 3 && (
                                <li>
                                    ...and {errorFields.length - 3} more errors
                                </li>
                            )}
                        </ul>
                    </div>
                ),
                duration: 5,
            });
        }
    };

    const { formCol, previewCol } = getFormLayout();
    const drawerWidth = getDrawerWidth();

    // Show loading state if members are being fetched
    if (isLoadingMembers && (newGroup || groupSelected)) {
        return (
            <Drawer
                open={newGroup || !!groupSelected}
                onClose={handleClose}
                footer={null}
                closable={false}
                width={drawerWidth}
                className="group-drawer"
                placement="right"
            >
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Progress type="circle" percent={75} />
                    <Text style={{ display: "block", marginTop: 16 }}>
                        Loading members...
                    </Text>
                </div>
            </Drawer>
        );
    }

    // Show error state if members fetch failed
    if (membersError && (newGroup || groupSelected)) {
        return (
            <Drawer
                open={newGroup || !!groupSelected}
                onClose={handleClose}
                footer={null}
                width={drawerWidth}
                className="group-drawer"
                placement="right"
            >
                <Alert
                    message="Error Loading Members"
                    description="Failed to load member data. Please try again."
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={refetchMembers}>
                            Retry
                        </Button>
                    }
                />
            </Drawer>
        );
    }

    return (
        <Drawer
            title={
                <div className="group-drawer-header">
                    <motion.div
                        className="drawer-title-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {/* {isEditMode ? (
                            <EditOutlined
                                style={{
                                    fontSize: isMobile ? 24 : 28,
                                    color: selectedColor,
                                    marginRight: isMobile ? 12 : 16,
                                }}
                            />
                        ) : (
                            <CrownFilled
                                style={{
                                    fontSize: isMobile ? 24 : 28,
                                    color: selectedColor,
                                    marginRight: isMobile ? 12 : 16,
                                }}
                            />
                        )} */}
                        <div>
                            <h2
                                style={{
                                    color: selectedColor,
                                    fontSize: isMobile ? "18px" : "24px",
                                    margin: 0,
                                }}
                            >
                                {isEditMode ? "Edit Group" : "Create New Group"}
                            </h2>
                            <Text
                                type="secondary"
                                style={{
                                    fontSize: isMobile ? 12 : 14,
                                    display: isMobile ? "none" : "block",
                                }}
                            >
                                {isEditMode
                                    ? "Update your team or department information"
                                    : "Configure your team or department"}
                            </Text>
                        </div>
                    </motion.div>
                </div>
            }
            placement="right"
            width={drawerWidth}
            onClose={handleClose}
            open={newGroup || !!groupSelected}
            className={`group-drawer ${isMobile ? "mobile-view" : ""}`}
            destroyOnClose
            closable={!loading}
            maskClosable={!loading}
            footer={
                <>
                    {activeTab === "basic" && (
                        <div className="drawer-actions">
                            <Space
                                direction={isMobile ? "vertical" : "horizontal"}
                                style={{ width: "100%" }}
                            >
                                <Button
                                    onClick={handleClose}
                                    size={isMobile ? "middle" : "large"}
                                    block={isMobile}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => setActiveTab("appearance")}
                                    size={isMobile ? "middle" : "large"}
                                    style={{
                                        background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}80)`,
                                        border: "none",
                                    }}
                                    icon={<IoColorPaletteOutline />}
                                    block={isMobile}
                                >
                                    {isMobile
                                        ? "Customize"
                                        : "Customize Appearance"}
                                </Button>
                            </Space>
                        </div>
                    )}
                    {activeTab === "appearance" && (
                        <div className="drawer-actions">
                            <Space
                                direction={isMobile ? "vertical" : "horizontal"}
                                style={{ width: "100%" }}
                            >
                                <Button
                                    onClick={() => setActiveTab("basic")}
                                    size={isMobile ? "middle" : "large"}
                                    icon={isMobile ? <ArrowLeftOutlined /> : null}
                                    block={isMobile}
                                >
                                    {isMobile ? "Back" : "Back to Basic Info"}
                                </Button>
                                <Button
                                    onClick={handleClose}
                                    size={isMobile ? "middle" : "large"}
                                    block={isMobile}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    onClick={() => form.submit()}
                                    size={isMobile ? "middle" : "large"}
                                    loading={loading}
                                    style={{
                                        background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}80)`,
                                        border: "none",
                                    }}
                                    icon={!isMobile && <CheckCircleOutlined />}
                                    block={isMobile}
                                >
                                    {isEditMode
                                        ? "Update Group"
                                        : "Create Group"}
                                </Button>
                            </Space>
                        </div>
                    )}
                </>
            }
        >
            <div className="group-drawer-container">
                {/* Template Selection Section - Only show for create mode */}
                {!isEditMode && (
                    <AnimatePresence>
                        {templateMode && (
                            <motion.div
                                className="template-selection-section"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <Alert
                                    message="Quick Start with Templates"
                                    description="Select a pre-configured template to get started quickly. You can customize all settings afterwards."
                                    type="info"
                                    showIcon
                                    icon={<RocketOutlined />}
                                    style={{ marginBottom: 24 }}
                                />

                                <div
                                    className={`template-grid ${isMobile ? "mobile-grid" : ""}`}
                                >
                                    {groupTemplates.map((template) => (
                                        <motion.div
                                            key={template.id}
                                            className={`template-card ${selectedTemplate?.id === template.id ? "selected" : ""}`}
                                            whileHover={
                                                !isMobile
                                                    ? { scale: 1.03, y: -4 }
                                                    : {}
                                            }
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() =>
                                                handleTemplateSelect(template)
                                            }
                                        >
                                            <div
                                                className="template-cover"
                                                style={{
                                                    backgroundImage: `url(${template.coverImage})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition:
                                                        "center",
                                                    height: isMobile
                                                        ? "80px"
                                                        : "120px",
                                                }}
                                            >
                                                <div
                                                    className="template-overlay"
                                                    style={{
                                                        background: `linear-gradient(to bottom, transparent, ${template.color}E6)`,
                                                    }}
                                                >
                                                    <div className="template-icon">
                                                        <Avatar
                                                            size={
                                                                isMobile
                                                                    ? 32
                                                                    : 48
                                                            }
                                                            icon={template.icon}
                                                            style={{
                                                                background: `linear-gradient(135deg, ${template.color}, ${template.color}80)`,
                                                                border: `3px solid white`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="template-content">
                                                <div className="template-header">
                                                    <h4
                                                        style={{
                                                            fontSize: isMobile
                                                                ? "14px"
                                                                : "16px",
                                                        }}
                                                    >
                                                        {template.name}
                                                    </h4>
                                                    <Tag
                                                        color={template.color}
                                                        style={{
                                                            border: "none",
                                                            color: "white",
                                                            fontSize: isMobile
                                                                ? "10px"
                                                                : "12px",
                                                        }}
                                                    >
                                                        Template
                                                    </Tag>
                                                </div>
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontSize: isMobile
                                                            ? "12px"
                                                            : "14px",
                                                    }}
                                                >
                                                    {template.description}
                                                </Text>
                                                <div className="template-stats">
                                                    <div className="stat-item">
                                                        <UserAddOutlined />
                                                        <span>
                                                            {
                                                                transformedMembers.length
                                                            }{" "}
                                                            available members
                                                        </span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <CheckCircleOutlined />
                                                        <span>
                                                            {
                                                                transformedMembers.filter(
                                                                    (m) =>
                                                                        m.status ===
                                                                        "active",
                                                                ).length
                                                            }{" "}
                                                            active
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="template-tags">
                                                    {template.tags
                                                        .slice(
                                                            0,
                                                            isMobile ? 2 : 3,
                                                        )
                                                        .map((tag, idx) => (
                                                            <Tag
                                                                key={idx}
                                                                color="default"
                                                                size="small"
                                                            >
                                                                {tag}
                                                            </Tag>
                                                        ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <Divider
                                    style={{
                                        margin: isMobile ? "16px 0" : "24px 0",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: selectedColor,
                                            fontWeight: 600,
                                        }}
                                    >
                                        OR
                                    </span>
                                </Divider>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="group-creation-tabs"
                    style={{ "--primary-color": selectedColor }}
                    tabBarStyle={isMobile ? { padding: "0 8px" } : {}}
                    tabPosition={isMobile ? "top" : "top"}
                    centered={isMobile}
                    tabBarExtraContent={
                        !isMobile && (
                            <div className="progress-indicator">
                                <Progress
                                    percent={
                                        activeTab === "basic"
                                            ? 33
                                            : activeTab === "appearance"
                                              ? 66
                                              : 100
                                    }
                                    size="small"
                                    strokeColor={selectedColor}
                                    showInfo={false}
                                />
                            </div>
                        )
                    }
                >
                    {/* Basic Information Tab */}
                    <TabPane
                        tab={
                            <span className="tab-label">
                                <AppstoreOutlined
                                    style={{
                                        color:
                                            activeTab === "basic"
                                                ? selectedColor
                                                : undefined,
                                        marginRight: isMobile ? 4 : 8,
                                    }}
                                />
                                {isMobile ? "Basic" : "Basic Info"}
                            </span>
                        }
                        key="basic"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            onFinishFailed={handleFormFailed}
                        >
                            <Row
                                gutter={[
                                    isMobile ? 16 : 24,
                                    isMobile ? 12 : 16,
                                ]}
                            >
                                <Col span={formCol}>
                                    <Card
                                        title="Group Details"
                                        bordered={false}
                                        className="section-card"
                                        style={{
                                            borderLeft: `4px solid ${selectedColor}`,
                                        }}
                                        size={isMobile ? "small" : "default"}
                                    >
                                        <Row gutter={isMobile ? 12 : 16}>
                                            <Col span={isMobile ? 24 : 12}>
                                                <Form.Item
                                                    name="name"
                                                    label={
                                                        <span className="form-label">
                                                            <TeamOutlined />{" "}
                                                            Group Name
                                                        </span>
                                                    }
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Please enter group name",
                                                        },
                                                        {
                                                            min: 3,
                                                            message:
                                                                "Name must be at least 3 characters",
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="e.g., Engineering Team"
                                                        size={
                                                            isMobile
                                                                ? "middle"
                                                                : "large"
                                                        }
                                                        prefix={
                                                            <CrownOutlined
                                                                style={{
                                                                    color: selectedColor,
                                                                }}
                                                            />
                                                        }
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col span={isMobile ? 24 : 12}>
                                                <Form.Item
                                                    name="code"
                                                    label={
                                                        <span className="form-label">
                                                            <CodeOutlined />{" "}
                                                            Group Code
                                                        </span>
                                                    }
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message:
                                                                "Please enter group code",
                                                        },
                                                        {
                                                            pattern:
                                                                /^[A-Z0-9_-]+$/,
                                                            message:
                                                                "Only uppercase letters, numbers, - and _",
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="DEV_TEAM"
                                                        size={
                                                            isMobile
                                                                ? "middle"
                                                                : "large"
                                                        }
                                                        disabled={isEditMode}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/* Members Section - Collapsable */}
                                        <motion.div
                                            className="collapsable-section"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ marginTop: "24px" }}
                                        >
                                            <div
                                                className="section-header-collapsable"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCollapse("members");
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <CollapseHeader
                                                    title="Group Members"
                                                    count={
                                                        selectedMembers.length
                                                    }
                                                    icon={
                                                        <UsergroupAddOutlined
                                                            style={{
                                                                color: "#52C41A",
                                                            }}
                                                        />
                                                    }
                                                    isOpen={
                                                        activeCollapses.members
                                                    }
                                                    color="#52C41A"
                                                    extraAction={{
                                                        icon:
                                                            selectedMembers.length ===
                                                            transformedMembers.length ? (
                                                                <MinusOutlined
                                                                    style={{
                                                                        fontSize:
                                                                            "12px",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <PlusOutlined
                                                                    style={{
                                                                        fontSize:
                                                                            "12px",
                                                                    }}
                                                                />
                                                            ),
                                                        text:
                                                            selectedMembers.length ===
                                                            transformedMembers.length
                                                                ? "Deselect All"
                                                                : "Select All",
                                                        onClick:
                                                            handleSelectAllMembers,
                                                    }}
                                                />
                                                <Text type="secondary">
                                                    Select employees who will be
                                                    members of this group
                                                </Text>
                                            </div>

                                            <AnimatePresence>
                                                {activeCollapses.members && (
                                                    <motion.div
                                                        className="collapsable-content"
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: "auto",
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        {/* Search Input */}
                                                        <div
                                                            className="search-approvers"
                                                            style={{
                                                                margin: "16px 0",
                                                            }}
                                                        >
                                                            <Input
                                                                value={
                                                                    searchMemberValue
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setSearchMemberValue(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    setCurrentMemberPage(
                                                                        1,
                                                                    );
                                                                }}
                                                                size={
                                                                    isMobile
                                                                        ? "middle"
                                                                        : "large"
                                                                }
                                                                prefix={
                                                                    <SearchOutlined />
                                                                }
                                                                placeholder="Search members by name, position, or department..."
                                                                allowClear
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Members Grid with Pagination */}
                                                        <div className="employees-grid">
                                                            {filteredMembers.length >
                                                            0 ? (
                                                                <>
                                                                    <div className="employees-list">
                                                                        {paginatedMembers.map(
                                                                            (
                                                                                employee,
                                                                            ) => {
                                                                                const isSelected =
                                                                                    selectedMembers.find(
                                                                                        (
                                                                                            emp,
                                                                                        ) =>
                                                                                            emp.id ===
                                                                                            employee.id,
                                                                                    );
                                                                                const isDefaultUser =
                                                                                    employee.is_you;
                                                                                return (
                                                                                    <EmployeeCard
                                                                                        key={
                                                                                            employee.id
                                                                                        }
                                                                                        employee={
                                                                                            employee
                                                                                        }
                                                                                        isSelected={
                                                                                            !!isSelected
                                                                                        }
                                                                                        onClick={
                                                                                            handleMemberSelect
                                                                                        }
                                                                                        type="member"
                                                                                        isMobile={
                                                                                            isMobile
                                                                                        }
                                                                                        selectedColor={
                                                                                            selectedColor
                                                                                        }
                                                                                        isDefault={
                                                                                            isDefaultUser
                                                                                        }
                                                                                    />
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>

                                                                    {/* Pagination */}
                                                                    <div
                                                                        className="pagination-section"
                                                                        style={{
                                                                            marginTop:
                                                                                "16px",
                                                                            display:
                                                                                "flex",
                                                                            justifyContent:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <Pagination
                                                                            current={
                                                                                currentMemberPage
                                                                            }
                                                                            total={
                                                                                filteredMembers.length
                                                                            }
                                                                            pageSize={
                                                                                pageSize
                                                                            }
                                                                            onChange={(
                                                                                page,
                                                                            ) =>
                                                                                setCurrentMemberPage(
                                                                                    page,
                                                                                )
                                                                            }
                                                                            onShowSizeChange={(
                                                                                current,
                                                                                size,
                                                                            ) =>
                                                                                setPageSize(
                                                                                    size,
                                                                                )
                                                                            }
                                                                            showSizeChanger={
                                                                                !isMobile
                                                                            }
                                                                            showQuickJumper={
                                                                                !isMobile
                                                                            }
                                                                            size={
                                                                                isMobile
                                                                                    ? "small"
                                                                                    : "default"
                                                                            }
                                                                            showTotal={(
                                                                                total,
                                                                                range,
                                                                            ) =>
                                                                                isMobile
                                                                                    ? `${range[0]}-${range[1]} of ${total}`
                                                                                    : `Showing ${range[0]}-${range[1]} of ${total} members`
                                                                            }
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <Empty
                                                                    description={
                                                                        <div>
                                                                            <div>
                                                                                No
                                                                                employees
                                                                                found
                                                                            </div>
                                                                            <Text
                                                                                type="secondary"
                                                                                style={{
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                Try
                                                                                a
                                                                                different
                                                                                search
                                                                                term
                                                                            </Text>
                                                                        </div>
                                                                    }
                                                                    image={
                                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                                    }
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Selected Members Preview */}
                                                        {selectedMembers.length >
                                                            0 && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: "auto",
                                                                }}
                                                                className="selected-approvers-preview"
                                                            >
                                                                <Divider orientation="left">
                                                                    <Text
                                                                        strong
                                                                    >
                                                                        Selected
                                                                        Members
                                                                        (
                                                                        {
                                                                            selectedMembers.length
                                                                        }
                                                                        )
                                                                    </Text>
                                                                </Divider>
                                                                <div className="selected-approvers-grid">
                                                                    {selectedMembers
                                                                        .slice(
                                                                            0,
                                                                            6,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                member,
                                                                            ) => {
                                                                                const isDefaultUser =
                                                                                    member.is_you;
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            member.id
                                                                                        }
                                                                                        className={`selected-approver-item member-item ${isDefaultUser ? "default-user" : ""}`}
                                                                                    >
                                                                                        <Avatar
                                                                                            size={
                                                                                                32
                                                                                            }
                                                                                            src={
                                                                                                member.avatar
                                                                                            }
                                                                                            icon={
                                                                                                <UserOutlined />
                                                                                            }
                                                                                        />
                                                                                        <div className="selected-approver-info">
                                                                                            <div className="selected-approver-name">
                                                                                                {
                                                                                                    member.name
                                                                                                }
                                                                                                {isDefaultUser && (
                                                                                                    <StarFilled
                                                                                                        style={{
                                                                                                            color: "#FFD700",
                                                                                                            marginLeft:
                                                                                                                "8px",
                                                                                                            fontSize:
                                                                                                                "12px",
                                                                                                        }}
                                                                                                    />
                                                                                                )}
                                                                                                {!isDefaultUser && (
                                                                                                    <CheckCircleFilled
                                                                                                        style={{
                                                                                                            color: "#52C41A",
                                                                                                            marginLeft:
                                                                                                                "8px",
                                                                                                            fontSize:
                                                                                                                "12px",
                                                                                                        }}
                                                                                                    />
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="selected-approver-position">
                                                                                                {
                                                                                                    member.position
                                                                                                }
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        )}
                                                                    {selectedMembers.length >
                                                                        6 && (
                                                                        <div className="more-members-count">
                                                                            +
                                                                            {selectedMembers.length -
                                                                                6}{" "}
                                                                            more
                                                                            members
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Approvers Section - Collapsable */}
                                        <motion.div
                                            className="collapsable-section"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ marginTop: "24px" }}
                                        >
                                            <div
                                                className="section-header-collapsable"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCollapse("approvers");
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <CollapseHeader
                                                    title="Approvers"
                                                    count={
                                                        selectedApprovers.length
                                                    }
                                                    icon={
                                                        <UserSwitchOutlined
                                                            style={{
                                                                color: selectedColor,
                                                            }}
                                                        />
                                                    }
                                                    isOpen={
                                                        activeCollapses.approvers
                                                    }
                                                    color={selectedColor}
                                                />
                                                <Text type="secondary">
                                                    Select employees who can
                                                    approve requests for this
                                                    group (must be members)
                                                </Text>
                                            </div>

                                            <AnimatePresence>
                                                {activeCollapses.approvers && (
                                                    <motion.div
                                                        className="collapsable-content"
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: "auto",
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        {/* Search Input */}
                                                        <div
                                                            className="search-approvers"
                                                            style={{
                                                                margin: "16px 0",
                                                            }}
                                                        >
                                                            <Input
                                                                value={
                                                                    searchValue
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setSearchValue(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    setCurrentApproverPage(
                                                                        1,
                                                                    );
                                                                }}
                                                                size={
                                                                    isMobile
                                                                        ? "middle"
                                                                        : "large"
                                                                }
                                                                prefix={
                                                                    <SearchOutlined />
                                                                }
                                                                placeholder="Search approvers by name, position, or department..."
                                                                allowClear
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Employees Grid with Pagination */}
                                                        <div className="employees-grid">
                                                            {filteredApprovers.length >
                                                            0 ? (
                                                                <>
                                                                    <div className="employees-list">
                                                                        {paginatedApprovers.map(
                                                                            (
                                                                                employee,
                                                                            ) => {
                                                                                const isSelected =
                                                                                    selectedApprovers.find(
                                                                                        (
                                                                                            emp,
                                                                                        ) =>
                                                                                            emp.id ===
                                                                                            employee.id,
                                                                                    );
                                                                                const isMember =
                                                                                    selectedMembers.find(
                                                                                        (
                                                                                            m,
                                                                                        ) =>
                                                                                            m.id ===
                                                                                            employee.id,
                                                                                    );
                                                                                const isDefaultUser =
                                                                                    employee.is_you;
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            employee.id
                                                                                        }
                                                                                        style={{
                                                                                            position:
                                                                                                "relative",
                                                                                        }}
                                                                                    >
                                                                                        {!isMember &&
                                                                                            !isDefaultUser && (
                                                                                                <Tooltip title="This employee is not a group member">
                                                                                                    <div
                                                                                                        style={{
                                                                                                            position:
                                                                                                                "absolute",
                                                                                                            top: 4,
                                                                                                            right: 4,
                                                                                                            zIndex: 1,
                                                                                                            background:
                                                                                                                "#FF4D4F",
                                                                                                            color: "white",
                                                                                                            padding:
                                                                                                                "2px 6px",
                                                                                                            borderRadius:
                                                                                                                "4px",
                                                                                                            fontSize:
                                                                                                                "10px",
                                                                                                            fontWeight:
                                                                                                                "bold",
                                                                                                        }}
                                                                                                    >
                                                                                                        Not
                                                                                                        Member
                                                                                                    </div>
                                                                                                </Tooltip>
                                                                                            )}
                                                                                        <EmployeeCard
                                                                                            employee={
                                                                                                employee
                                                                                            }
                                                                                            isSelected={
                                                                                                !!isSelected
                                                                                            }
                                                                                            onClick={
                                                                                                handleApproverSelect
                                                                                            }
                                                                                            type="approver"
                                                                                            isMobile={
                                                                                                isMobile
                                                                                            }
                                                                                            selectedColor={
                                                                                                selectedColor
                                                                                            }
                                                                                            isDefault={
                                                                                                isDefaultUser
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>

                                                                    {/* Pagination */}
                                                                    <div
                                                                        className="pagination-section"
                                                                        style={{
                                                                            marginTop:
                                                                                "16px",
                                                                            display:
                                                                                "flex",
                                                                            justifyContent:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <Pagination
                                                                            current={
                                                                                currentApproverPage
                                                                            }
                                                                            total={
                                                                                filteredApprovers.length
                                                                            }
                                                                            pageSize={
                                                                                pageSize
                                                                            }
                                                                            onChange={(
                                                                                page,
                                                                            ) =>
                                                                                setCurrentApproverPage(
                                                                                    page,
                                                                                )
                                                                            }
                                                                            onShowSizeChange={(
                                                                                current,
                                                                                size,
                                                                            ) =>
                                                                                setPageSize(
                                                                                    size,
                                                                                )
                                                                            }
                                                                            showSizeChanger={
                                                                                !isMobile
                                                                            }
                                                                            showQuickJumper={
                                                                                !isMobile
                                                                            }
                                                                            size={
                                                                                isMobile
                                                                                    ? "small"
                                                                                    : "default"
                                                                            }
                                                                            showTotal={(
                                                                                total,
                                                                                range,
                                                                            ) =>
                                                                                isMobile
                                                                                    ? `${range[0]}-${range[1]} of ${total}`
                                                                                    : `Showing ${range[0]}-${range[1]} of ${total} employees`
                                                                            }
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <Empty
                                                                    description={
                                                                        <div>
                                                                            <div>
                                                                                No
                                                                                employees
                                                                                found
                                                                            </div>
                                                                            <Text
                                                                                type="secondary"
                                                                                style={{
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                Try
                                                                                a
                                                                                different
                                                                                search
                                                                                term
                                                                            </Text>
                                                                        </div>
                                                                    }
                                                                    image={
                                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                                    }
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Selected Approvers Preview */}
                                                        {selectedApprovers.length >
                                                            0 && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: "auto",
                                                                }}
                                                                className="selected-approvers-preview"
                                                            >
                                                                <Divider orientation="left">
                                                                    <Text
                                                                        strong
                                                                    >
                                                                        Selected
                                                                        Approvers
                                                                        (
                                                                        {
                                                                            selectedApprovers.length
                                                                        }
                                                                        )
                                                                    </Text>
                                                                </Divider>
                                                                <div className="selected-approvers-grid">
                                                                    {selectedApprovers.map(
                                                                        (
                                                                            approver,
                                                                        ) => {
                                                                            const isMember =
                                                                                selectedMembers.find(
                                                                                    (
                                                                                        m,
                                                                                    ) =>
                                                                                        m.id ===
                                                                                        approver.id,
                                                                                );
                                                                            const isDefaultUser =
                                                                                approver.is_you;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        approver.id
                                                                                    }
                                                                                    className={`selected-approver-item ${isDefaultUser ? "default-user" : ""}`}
                                                                                    style={{
                                                                                        opacity:
                                                                                            isMember ||
                                                                                            isDefaultUser
                                                                                                ? 1
                                                                                                : 0.6,
                                                                                        position:
                                                                                            "relative",
                                                                                    }}
                                                                                >
                                                                                    {!isMember &&
                                                                                        !isDefaultUser && (
                                                                                            <Tooltip title="This approver is not a group member">
                                                                                                <div
                                                                                                    style={{
                                                                                                        position:
                                                                                                            "absolute",
                                                                                                        top: 5,
                                                                                                        right: 5,
                                                                                                        background:
                                                                                                            "#FF4D4F",
                                                                                                        color: "white",
                                                                                                        width: 20,
                                                                                                        height: 20,
                                                                                                        borderRadius:
                                                                                                            "50%",
                                                                                                        display:
                                                                                                            "flex",
                                                                                                        alignItems:
                                                                                                            "center",
                                                                                                        justifyContent:
                                                                                                            "center",
                                                                                                        fontSize:
                                                                                                            "10px",
                                                                                                        fontWeight:
                                                                                                            "bold",
                                                                                                    }}
                                                                                                >
                                                                                                    !
                                                                                                </div>
                                                                                            </Tooltip>
                                                                                        )}
                                                                                    <Avatar
                                                                                        size={
                                                                                            32
                                                                                        }
                                                                                        src={
                                                                                            approver.avatar
                                                                                        }
                                                                                        style={{
                                                                                            border: `2px solid ${selectedColor}`,
                                                                                        }}
                                                                                        icon={
                                                                                            <UserOutlined />
                                                                                        }
                                                                                    />
                                                                                    <div className="selected-approver-info">
                                                                                        <div className="selected-approver-name">
                                                                                            {
                                                                                                approver.name
                                                                                            }
                                                                                            {isDefaultUser ? (
                                                                                                <StarFilled
                                                                                                    style={{
                                                                                                        color: "#FFD700",
                                                                                                        marginLeft:
                                                                                                            "8px",
                                                                                                        fontSize:
                                                                                                            "12px",
                                                                                                    }}
                                                                                                />
                                                                                            ) : (
                                                                                                <CheckCircleFilled
                                                                                                    style={{
                                                                                                        color: selectedColor,
                                                                                                        marginLeft:
                                                                                                            "8px",
                                                                                                        fontSize:
                                                                                                            "12px",
                                                                                                    }}
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="selected-approver-position">
                                                                                            {
                                                                                                approver.position
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Signatories Section - Collapsable */}
                                        <motion.div
                                            className="collapsable-section"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            style={{ marginTop: "24px" }}
                                        >
                                            <div
                                                className="section-header-collapsable"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCollapse(
                                                        "signatories",
                                                    );
                                                }}
                                                style={{ cursor: "pointer" }}
                                            >
                                                <CollapseHeader
                                                    title="Signatories"
                                                    count={
                                                        selectedSignatories.length
                                                    }
                                                    icon={
                                                        <SignatureOutlined
                                                            style={{
                                                                color: selectedColor,
                                                            }}
                                                        />
                                                    }
                                                    isOpen={
                                                        activeCollapses.signatories
                                                    }
                                                    color="#FA8C16"
                                                />
                                                <Text type="secondary">
                                                    Select authorized
                                                    signatories for official
                                                    documents (optional)
                                                </Text>
                                            </div>

                                            <AnimatePresence>
                                                {activeCollapses.signatories && (
                                                    <motion.div
                                                        className="collapsable-content"
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: "auto",
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    >
                                                        {/* Search Input */}
                                                        <div
                                                            className="search-approvers"
                                                            style={{
                                                                margin: "16px 0",
                                                            }}
                                                        >
                                                            <Input
                                                                value={
                                                                    searchSignatoryValue
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setSearchSignatoryValue(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                    setCurrentSignatoryPage(
                                                                        1,
                                                                    );
                                                                }}
                                                                size={
                                                                    isMobile
                                                                        ? "middle"
                                                                        : "large"
                                                                }
                                                                prefix={
                                                                    <SearchOutlined />
                                                                }
                                                                placeholder="Search signatories by name, position, or department..."
                                                                allowClear
                                                                style={{
                                                                    width: "100%",
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Employees Grid with Pagination */}
                                                        <div className="employees-grid">
                                                            {filteredSignatories.length >
                                                            0 ? (
                                                                <>
                                                                    <div className="employees-list">
                                                                        {paginatedSignatories.map(
                                                                            (
                                                                                employee,
                                                                            ) => {
                                                                                const isSelected =
                                                                                    selectedSignatories.find(
                                                                                        (
                                                                                            emp,
                                                                                        ) =>
                                                                                            emp.id ===
                                                                                            employee.id,
                                                                                    );
                                                                                const isMember =
                                                                                    selectedMembers.find(
                                                                                        (
                                                                                            m,
                                                                                        ) =>
                                                                                            m.id ===
                                                                                            employee.id,
                                                                                    );
                                                                                const isDefaultUser = false;
                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            employee.id
                                                                                        }
                                                                                        style={{
                                                                                            position:
                                                                                                "relative",
                                                                                        }}
                                                                                    >
                                                                                        {!isMember &&
                                                                                            !isDefaultUser && (
                                                                                                <Tooltip title="This employee is not a group member">
                                                                                                    <div
                                                                                                        style={{
                                                                                                            position:
                                                                                                                "absolute",
                                                                                                            top: 4,
                                                                                                            right: 4,
                                                                                                            zIndex: 1,
                                                                                                            background:
                                                                                                                "#FF4D4F",
                                                                                                            color: "white",
                                                                                                            padding:
                                                                                                                "2px 6px",
                                                                                                            borderRadius:
                                                                                                                "4px",
                                                                                                            fontSize:
                                                                                                                "10px",
                                                                                                            fontWeight:
                                                                                                                "bold",
                                                                                                        }}
                                                                                                    >
                                                                                                        Not
                                                                                                        Member
                                                                                                    </div>
                                                                                                </Tooltip>
                                                                                            )}
                                                                                        <EmployeeCard
                                                                                            employee={
                                                                                                employee
                                                                                            }
                                                                                            isSelected={
                                                                                                !!isSelected
                                                                                            }
                                                                                            onClick={
                                                                                                handleSignatorySelect
                                                                                            }
                                                                                            type="signatory"
                                                                                            isMobile={
                                                                                                isMobile
                                                                                            }
                                                                                            selectedColor={
                                                                                                selectedColor
                                                                                            }
                                                                                            isDefault={
                                                                                                isDefaultUser
                                                                                            }
                                                                                        />
                                                                                    </div>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>

                                                                    {/* Pagination */}
                                                                    <div
                                                                        className="pagination-section"
                                                                        style={{
                                                                            marginTop:
                                                                                "16px",
                                                                            display:
                                                                                "flex",
                                                                            justifyContent:
                                                                                "center",
                                                                        }}
                                                                    >
                                                                        <Pagination
                                                                            current={
                                                                                currentSignatoryPage
                                                                            }
                                                                            total={
                                                                                filteredSignatories.length
                                                                            }
                                                                            pageSize={
                                                                                pageSize
                                                                            }
                                                                            onChange={(
                                                                                page,
                                                                            ) =>
                                                                                setCurrentSignatoryPage(
                                                                                    page,
                                                                                )
                                                                            }
                                                                            onShowSizeChange={(
                                                                                current,
                                                                                size,
                                                                            ) =>
                                                                                setPageSize(
                                                                                    size,
                                                                                )
                                                                            }
                                                                            showSizeChanger={
                                                                                !isMobile
                                                                            }
                                                                            showQuickJumper={
                                                                                !isMobile
                                                                            }
                                                                            size={
                                                                                isMobile
                                                                                    ? "small"
                                                                                    : "default"
                                                                            }
                                                                            showTotal={(
                                                                                total,
                                                                                range,
                                                                            ) =>
                                                                                isMobile
                                                                                    ? `${range[0]}-${range[1]} of ${total}`
                                                                                    : `Showing ${range[0]}-${range[1]} of ${total} signatories`
                                                                            }
                                                                        />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <Empty
                                                                    description={
                                                                        <div>
                                                                            <div>
                                                                                No
                                                                                employees
                                                                                found
                                                                            </div>
                                                                            <Text
                                                                                type="secondary"
                                                                                style={{
                                                                                    fontSize:
                                                                                        "12px",
                                                                                }}
                                                                            >
                                                                                Try
                                                                                a
                                                                                different
                                                                                search
                                                                                term
                                                                            </Text>
                                                                        </div>
                                                                    }
                                                                    image={
                                                                        Empty.PRESENTED_IMAGE_SIMPLE
                                                                    }
                                                                />
                                                            )}
                                                        </div>

                                                        {/* Selected Signatories Preview */}
                                                        {selectedSignatories.length >
                                                            0 && (
                                                            <motion.div
                                                                initial={{
                                                                    opacity: 0,
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    height: "auto",
                                                                }}
                                                                className="selected-approvers-preview"
                                                            >
                                                                <Divider orientation="left">
                                                                    <Text
                                                                        strong
                                                                    >
                                                                        Selected
                                                                        Signatories
                                                                        (
                                                                        {
                                                                            selectedSignatories.length
                                                                        }
                                                                        )
                                                                    </Text>
                                                                </Divider>
                                                                <div className="selected-approvers-grid">
                                                                    {selectedSignatories.map(
                                                                        (
                                                                            signatory,
                                                                        ) => {
                                                                            const isMember =
                                                                                selectedMembers.find(
                                                                                    (
                                                                                        m,
                                                                                    ) =>
                                                                                        m.id ===
                                                                                        signatory.id,
                                                                                );
                                                                            const isDefaultUser =
                                                                                signatory.is_you;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        signatory.id
                                                                                    }
                                                                                    className="selected-approver-item signatory-item"
                                                                                    style={{
                                                                                        opacity:
                                                                                            isMember ||
                                                                                            isDefaultUser
                                                                                                ? 1
                                                                                                : 0.6,
                                                                                        position:
                                                                                            "relative",
                                                                                    }}
                                                                                >
                                                                                    {!isMember &&
                                                                                        !isDefaultUser && (
                                                                                            <Tooltip title="This signatory is not a group member">
                                                                                                <div
                                                                                                    style={{
                                                                                                        position:
                                                                                                            "absolute",
                                                                                                        top: 5,
                                                                                                        right: 5,
                                                                                                        background:
                                                                                                            "#FF4D4F",
                                                                                                        color: "white",
                                                                                                        width: 20,
                                                                                                        height: 20,
                                                                                                        borderRadius:
                                                                                                            "50%",
                                                                                                        display:
                                                                                                            "flex",
                                                                                                        alignItems:
                                                                                                            "center",
                                                                                                        justifyContent:
                                                                                                            "center",
                                                                                                        fontSize:
                                                                                                            "10px",
                                                                                                        fontWeight:
                                                                                                            "bold",
                                                                                                    }}
                                                                                                >
                                                                                                    !
                                                                                                </div>
                                                                                            </Tooltip>
                                                                                        )}
                                                                                    <Avatar
                                                                                        size={
                                                                                            32
                                                                                        }
                                                                                        src={
                                                                                            signatory.avatar
                                                                                        }
                                                                                        style={{
                                                                                            border: `2px solid #FA8C16`,
                                                                                        }}
                                                                                        icon={
                                                                                            <UserOutlined />
                                                                                        }
                                                                                    />
                                                                                    <div className="selected-approver-info">
                                                                                        <div className="selected-approver-name">
                                                                                            {
                                                                                                signatory.name
                                                                                            }
                                                                                            {isDefaultUser && (
                                                                                                <StarFilled
                                                                                                    style={{
                                                                                                        color: "#FFD700",
                                                                                                        marginLeft:
                                                                                                            "8px",
                                                                                                        fontSize:
                                                                                                            "12px",
                                                                                                    }}
                                                                                                />
                                                                                            )}
                                                                                            <Tag
                                                                                                color="gold"
                                                                                                icon={
                                                                                                    <SignatureOutlined />
                                                                                                }
                                                                                                style={{
                                                                                                    marginLeft:
                                                                                                        "8px",
                                                                                                    fontSize:
                                                                                                        "10px",
                                                                                                    padding:
                                                                                                        "0 6px",
                                                                                                    height: "18px",
                                                                                                    lineHeight:
                                                                                                        "16px",
                                                                                                }}
                                                                                            >
                                                                                                Signatory
                                                                                            </Tag>
                                                                                        </div>
                                                                                        <div className="selected-approver-position">
                                                                                            {
                                                                                                signatory.position
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </Card>
                                </Col>

                                {!isMobile && previewCol > 0 && (
                                    <Col span={previewCol}>
                                        {/* Live Preview Card */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="preview-section"
                                        >
                                            <Card
                                                title={
                                                    <span className="preview-title">
                                                        <EyeOutlined /> Live
                                                        Preview
                                                    </span>
                                                }
                                                className="group-preview-card"
                                                style={{
                                                    border: `1px solid ${selectedColor}40`,
                                                    boxShadow: `0 4px 12px ${selectedColor}20`,
                                                }}
                                                size="small"
                                            >
                                                {/* Cover Image Preview */}
                                                <div
                                                    className="preview-cover"
                                                    style={{
                                                        background:
                                                            coverImagePreview
                                                                ? `url(${coverImagePreview}) center/cover`
                                                                : gradientStyle,
                                                        height: 120,
                                                        borderRadius:
                                                            "8px 8px 0 0",
                                                        margin: "-16px -16px 16px -16px",
                                                        position: "relative",
                                                    }}
                                                >
                                                    {!coverImagePreview && (
                                                        <div className="cover-placeholder">
                                                            <PictureOutlined
                                                                style={{
                                                                    fontSize: 32,
                                                                    color: selectedColor,
                                                                }}
                                                            />
                                                            <Text type="secondary">
                                                                Cover Image
                                                            </Text>
                                                        </div>
                                                    )}
                                                    <div
                                                        className="cover-overlay"
                                                        style={{
                                                            background: `linear-gradient(to bottom, transparent, ${selectedColor}40)`,
                                                            position:
                                                                "absolute",
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            height: 40,
                                                        }}
                                                    />
                                                </div>

                                                <div className="preview-content">
                                                    <div className="preview-header">
                                                        <Avatar
                                                            size={64}
                                                            style={{
                                                                background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}80)`,
                                                                marginTop: -32,
                                                                border: `4px solid white`,
                                                                boxShadow: `0 4px 12px ${selectedColor}40`,
                                                            }}
                                                            icon={
                                                                <TeamOutlined />
                                                            }
                                                        />
                                                        <div className="preview-title-section">
                                                            <h3
                                                                style={{
                                                                    margin: "8px 0 4px 0",
                                                                    color: selectedColor,
                                                                }}
                                                            >
                                                                {form.getFieldValue(
                                                                    "name",
                                                                ) ||
                                                                    (isEditMode
                                                                        ? groupSelected?.group_name
                                                                        : "New Group")}
                                                            </h3>
                                                            <Text type="secondary">
                                                                {form
                                                                    .getFieldValue(
                                                                        "description",
                                                                    )
                                                                    ?.substring(
                                                                        0,
                                                                        60,
                                                                    ) ||
                                                                    "Group description will appear here..."}
                                                            </Text>
                                                        </div>
                                                    </div>

                                                    <Divider
                                                        style={{
                                                            margin: "16px 0",
                                                        }}
                                                    />

                                                    {/* Preview Members */}
                                                    <div className="preview-approvers">
                                                        <div className="preview-section-header">
                                                            <UsergroupAddOutlined />
                                                            <span>Members</span>
                                                            <Badge
                                                                count={
                                                                    selectedMembers.length
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        "#52C41A",
                                                                    marginLeft:
                                                                        "8px",
                                                                }}
                                                            />
                                                        </div>
                                                        {selectedMembers.length >
                                                        0 ? (
                                                            <div className="preview-approvers-list">
                                                                {selectedMembers
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            member,
                                                                        ) => {
                                                                            const isDefaultUser =
                                                                                member.is_you;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        member.id
                                                                                    }
                                                                                    className="preview-approver-item"
                                                                                >
                                                                                    <Avatar
                                                                                        size="small"
                                                                                        src={
                                                                                            member.avatar
                                                                                        }
                                                                                        style={{
                                                                                            border: `2px solid ${isDefaultUser ? "#FFD700" : "#52C41A80"}`,
                                                                                        }}
                                                                                    />
                                                                                    <div className="preview-approver-info">
                                                                                        <div className="preview-approver-name">
                                                                                            {
                                                                                                member.name
                                                                                            }
                                                                                            {isDefaultUser && (
                                                                                                <StarFilled
                                                                                                    style={{
                                                                                                        color: "#FFD700",
                                                                                                        marginLeft:
                                                                                                            "4px",
                                                                                                        fontSize:
                                                                                                            "10px",
                                                                                                    }}
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="preview-approver-position">
                                                                                            {
                                                                                                member.position
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                {selectedMembers.length >
                                                                    3 && (
                                                                    <div className="more-approvers">
                                                                        +
                                                                        {selectedMembers.length -
                                                                            3}{" "}
                                                                        more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Text
                                                                type="secondary"
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    textAlign:
                                                                        "center",
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                No members
                                                                selected
                                                            </Text>
                                                        )}
                                                    </div>

                                                    {/* Preview Approvers */}
                                                    <div
                                                        className="preview-approvers"
                                                        style={{
                                                            marginTop: "16px",
                                                        }}
                                                    >
                                                        <div className="preview-section-header">
                                                            <UserSwitchOutlined />
                                                            <span>
                                                                Approvers
                                                            </span>
                                                            <Badge
                                                                count={
                                                                    selectedApprovers.length
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        selectedColor,
                                                                    marginLeft:
                                                                        "8px",
                                                                }}
                                                            />
                                                        </div>
                                                        {selectedApprovers.length >
                                                        0 ? (
                                                            <div className="preview-approvers-list">
                                                                {selectedApprovers
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            approver,
                                                                        ) => {
                                                                            const isDefaultUser =
                                                                                approver.is_you;
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        approver.id
                                                                                    }
                                                                                    className="preview-approver-item"
                                                                                >
                                                                                    <Avatar
                                                                                        size="small"
                                                                                        src={
                                                                                            approver.avatar
                                                                                        }
                                                                                        style={{
                                                                                            border: `2px solid ${isDefaultUser ? "#FFD700" : `${selectedColor}80`}`,
                                                                                        }}
                                                                                    />
                                                                                    <div className="preview-approver-info">
                                                                                        <div className="preview-approver-name">
                                                                                            {
                                                                                                approver.name
                                                                                            }
                                                                                            {isDefaultUser && (
                                                                                                <StarFilled
                                                                                                    style={{
                                                                                                        color: "#FFD700",
                                                                                                        marginLeft:
                                                                                                            "4px",
                                                                                                        fontSize:
                                                                                                            "10px",
                                                                                                    }}
                                                                                                />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="preview-approver-position">
                                                                                            {
                                                                                                approver.position
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}
                                                                {selectedApprovers.length >
                                                                    3 && (
                                                                    <div className="more-approvers">
                                                                        +
                                                                        {selectedApprovers.length -
                                                                            3}{" "}
                                                                        more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Text
                                                                type="secondary"
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    textAlign:
                                                                        "center",
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                No approvers
                                                                selected
                                                            </Text>
                                                        )}
                                                    </div>

                                                    {/* Preview Signatories */}
                                                    <div
                                                        className="preview-approvers"
                                                        style={{
                                                            marginTop: "16px",
                                                        }}
                                                    >
                                                        <div className="preview-section-header">
                                                            <SignatureOutlined />
                                                            <span>
                                                                Signatories
                                                            </span>
                                                            <Badge
                                                                count={
                                                                    selectedSignatories.length
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        "#FA8C16",
                                                                    marginLeft:
                                                                        "8px",
                                                                }}
                                                            />
                                                        </div>
                                                        {selectedSignatories.length >
                                                        0 ? (
                                                            <div className="preview-approvers-list">
                                                                {selectedSignatories
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (
                                                                            signatory,
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    signatory.id
                                                                                }
                                                                                className="preview-approver-item"
                                                                            >
                                                                                <Avatar
                                                                                    size="small"
                                                                                    src={
                                                                                        signatory.avatar
                                                                                    }
                                                                                    style={{
                                                                                        border: `2px solid #FA8C1680`,
                                                                                    }}
                                                                                />
                                                                                <div className="preview-approver-info">
                                                                                    <div className="preview-approver-name">
                                                                                        {
                                                                                            signatory.name
                                                                                        }
                                                                                    </div>
                                                                                    <div className="preview-approver-position">
                                                                                        {
                                                                                            signatory.position
                                                                                        }
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ),
                                                                    )}
                                                                {selectedSignatories.length >
                                                                    3 && (
                                                                    <div className="more-approvers">
                                                                        +
                                                                        {selectedSignatories.length -
                                                                            3}{" "}
                                                                        more
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <Text
                                                                type="secondary"
                                                                style={{
                                                                    display:
                                                                        "block",
                                                                    textAlign:
                                                                        "center",
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                No signatories
                                                                selected
                                                            </Text>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    </Col>
                                )}
                            </Row>
                        </Form>
                    </TabPane>

                    {/* Appearance Tab */}
                    <TabPane
                        tab={
                            <span className="tab-label">
                                <IoColorPaletteOutline
                                    style={{
                                        color:
                                            activeTab === "appearance"
                                                ? selectedColor
                                                : undefined,
                                        marginRight: isMobile ? 4 : 8,
                                    }}
                                />
                                {isMobile ? "Appearance" : "Appearance"}
                            </span>
                        }
                        key="appearance"
                    >
                        <div className="appearance-section">
                            <Row
                                gutter={[
                                    isMobile ? 16 : 24,
                                    isMobile ? 16 : 24,
                                ]}
                            >
                                <Col span={isMobile ? 24 : 12}>
                                    <Card
                                        title={
                                            <span className="section-title">
                                                <FileImageOutlined /> Cover
                                                Image
                                            </span>
                                        }
                                        className="appearance-card"
                                        style={{
                                            borderLeft: `4px solid ${selectedColor}`,
                                        }}
                                        size={isMobile ? "small" : "default"}
                                    >
                                        <div className="cover-image-section">
                                            <div className="cover-upload-area">
                                                <Upload.Dragger
                                                    accept="image/*"
                                                    showUploadList={false}
                                                    beforeUpload={(file) => {
                                                        handleCoverImageUpload(
                                                            file,
                                                        );
                                                        return false;
                                                    }}
                                                    style={{
                                                        padding: isMobile
                                                            ? 20
                                                            : 40,
                                                        background:
                                                            gradientStyle,
                                                        border: `2px dashed ${selectedColor}80`,
                                                    }}
                                                >
                                                    <PictureOutlined
                                                        style={{
                                                            fontSize: isMobile
                                                                ? 32
                                                                : 48,
                                                            color: selectedColor,
                                                            marginBottom:
                                                                isMobile
                                                                    ? 12
                                                                    : 16,
                                                        }}
                                                    />
                                                    <p
                                                        className="ant-upload-text"
                                                        style={{
                                                            color: selectedColor,
                                                            fontSize: isMobile
                                                                ? "14px"
                                                                : "16px",
                                                        }}
                                                    >
                                                        Drag & drop cover image
                                                        here
                                                    </p>
                                                    <p
                                                        className="ant-upload-hint"
                                                        style={{
                                                            color:
                                                                selectedColor +
                                                                "CC",
                                                            fontSize: isMobile
                                                                ? "12px"
                                                                : "14px",
                                                        }}
                                                    >
                                                        Supports JPG, PNG up to
                                                        5MB
                                                    </p>
                                                    <Button
                                                        icon={
                                                            <UploadOutlined />
                                                        }
                                                        style={{
                                                            background:
                                                                selectedColor,
                                                            borderColor:
                                                                selectedColor,
                                                            color: "white",
                                                        }}
                                                        size={
                                                            isMobile
                                                                ? "small"
                                                                : "middle"
                                                        }
                                                    >
                                                        Browse Files
                                                    </Button>
                                                </Upload.Dragger>
                                            </div>

                                            {coverImagePreview && (
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="cover-image-preview"
                                                >
                                                    <Divider>Preview</Divider>
                                                    <div
                                                        className="cover-preview-large"
                                                        style={{
                                                            backgroundImage: `url(${coverImagePreview})`,
                                                            backgroundSize:
                                                                "cover",
                                                            backgroundPosition:
                                                                "center",
                                                            height: isMobile
                                                                ? 120
                                                                : 200,
                                                            borderRadius: 8,
                                                            position:
                                                                "relative",
                                                            marginBottom: 16,
                                                        }}
                                                    >
                                                        <div
                                                            className="cover-overlay"
                                                            style={{
                                                                background: `linear-gradient(to bottom, transparent, ${selectedColor}E6)`,
                                                                position:
                                                                    "absolute",
                                                                bottom: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: 80,
                                                                borderBottomLeftRadius: 8,
                                                                borderBottomRightRadius: 8,
                                                            }}
                                                        />
                                                        <div
                                                            className="cover-info"
                                                            style={{
                                                                position:
                                                                    "absolute",
                                                                bottom: 16,
                                                                left: 16,
                                                                color: "white",
                                                            }}
                                                        >
                                                            <h3
                                                                style={{
                                                                    margin: 0,
                                                                    color: "white",
                                                                    fontSize:
                                                                        isMobile
                                                                            ? "14px"
                                                                            : "16px",
                                                                }}
                                                            >
                                                                {form.getFieldValue(
                                                                    "name",
                                                                ) ||
                                                                    (isEditMode
                                                                        ? groupSelected?.group_name
                                                                        : "Group Name")}
                                                            </h3>
                                                            <Text
                                                                style={{
                                                                    color: "white",
                                                                    fontSize:
                                                                        isMobile
                                                                            ? "12px"
                                                                            : "14px",
                                                                }}
                                                            >
                                                                {form
                                                                    .getFieldValue(
                                                                        "description",
                                                                    )
                                                                    ?.substring(
                                                                        0,
                                                                        80,
                                                                    ) ||
                                                                    "Group description..."}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <div className="cover-image-actions">
                                                        <Space
                                                            direction={
                                                                isMobile
                                                                    ? "vertical"
                                                                    : "horizontal"
                                                            }
                                                            style={{
                                                                width: "100%",
                                                            }}
                                                        >
                                                            <Button
                                                                icon={
                                                                    <EyeOutlined />
                                                                }
                                                                onClick={() =>
                                                                    window.open(
                                                                        coverImagePreview,
                                                                        "_blank",
                                                                    )
                                                                }
                                                                size={
                                                                    isMobile
                                                                        ? "small"
                                                                        : "middle"
                                                                }
                                                                block={isMobile}
                                                            >
                                                                View Full Size
                                                            </Button>
                                                            <Button
                                                                danger
                                                                icon={
                                                                    <DeleteOutlined />
                                                                }
                                                                onClick={
                                                                    removeCoverImage
                                                                }
                                                                size={
                                                                    isMobile
                                                                        ? "small"
                                                                        : "middle"
                                                                }
                                                                block={isMobile}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </Space>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </Card>
                                </Col>

                                <Col span={isMobile ? 24 : 12}>
                                    <Card
                                        title={
                                            <span className="section-title">
                                                <IoColorPaletteOutline /> Color
                                                Theme
                                            </span>
                                        }
                                        className="appearance-card"
                                        style={{
                                            borderLeft: `4px solid ${selectedColor}`,
                                        }}
                                        size={isMobile ? "small" : "default"}
                                    >
                                        <div className="color-selection">
                                            <div className="color-picker-section">
                                                <h4>Primary Color</h4>
                                                <div
                                                    className="current-color"
                                                    style={{
                                                        background:
                                                            selectedColor,
                                                        width: isMobile
                                                            ? 40
                                                            : 48,
                                                        height: isMobile
                                                            ? 40
                                                            : 48,
                                                        borderRadius: 8,
                                                        marginBottom: 16,
                                                        border: `3px solid ${selectedColor}40`,
                                                        boxShadow: `0 4px 12px ${selectedColor}40`,
                                                    }}
                                                />
                                                <ColorPicker
                                                    value={selectedColor}
                                                    onChange={handleColorChange}
                                                    size={
                                                        isMobile
                                                            ? "middle"
                                                            : "large"
                                                    }
                                                    style={{ width: "100%" }}
                                                />
                                            </div>

                                            <Divider>Quick Pick</Divider>

                                            <div
                                                className={`color-grid ${isMobile ? "mobile-grid" : ""}`}
                                            >
                                                {colorOptions.map(
                                                    (colorObj) => (
                                                        <motion.div
                                                            key={colorObj.color}
                                                            className={`color-option ${selectedColor === colorObj.color ? "selected" : ""}`}
                                                            whileHover={
                                                                !isMobile
                                                                    ? {
                                                                          scale: 1.1,
                                                                      }
                                                                    : {}
                                                            }
                                                            whileTap={{
                                                                scale: 0.95,
                                                            }}
                                                            onClick={() =>
                                                                setSelectedColor(
                                                                    colorObj.color,
                                                                )
                                                            }
                                                        >
                                                            <div
                                                                className="color-dot"
                                                                style={{
                                                                    backgroundColor:
                                                                        colorObj.color,
                                                                }}
                                                            />
                                                            <small
                                                                style={{
                                                                    fontSize:
                                                                        isMobile
                                                                            ? "10px"
                                                                            : "12px",
                                                                }}
                                                            >
                                                                {colorObj.name}
                                                            </small>
                                                        </motion.div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        </Drawer>
    );
};

export default GroupDrawer;