import React from "react";
import { Form, Input, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCreateUserMutation, useUpdateUserMutation } from "../../hooks/queries/users.query";

const { Option } = Select;

interface UserFormProps {
  initialValues?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialValues?.id;
  
  const createMutation = useCreateUserMutation({
    onSuccess: () => {
      message.success("User created successfully");
      onSuccess?.();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });
  
  const updateMutation = useUpdateUserMutation({
    onSuccess: () => {
      message.success("User updated successfully");
      onSuccess?.();
    },
    onError: (error) => {
      message.error(error.message);
    },
  });
  
  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    
    // Append form data
    Object.keys(values).forEach((key) => {
      if (key === "avatar" && values[key]?.file) {
        formData.append("avatar", values[key].file);
      } else if (values[key] !== undefined) {
        formData.append(key, values[key]);
      }
    });
    
    if (isEditing) {
      await updateMutation.mutateAsync({
        id: initialValues.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };
  
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please enter name" }]}
      >
        <Input placeholder="Enter full name" />
      </Form.Item>
      
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please enter email" },
          { type: "email", message: "Please enter valid email" },
        ]}
      >
        <Input placeholder="Enter email address" />
      </Form.Item>
      
      {!isEditing && (
        <>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          
          <Form.Item
            name="password_confirmation"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
        </>
      )}
      
      <Form.Item
        name="role"
        label="Role"
        rules={[{ required: true, message: "Please select role" }]}
      >
        <Select placeholder="Select role">
          <Option value="admin">Admin</Option>
          <Option value="editor">Editor</Option>
          <Option value="viewer">Viewer</Option>
          <Option value="user">User</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Please select status" }]}
      >
        <Select placeholder="Select status">
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
          <Option value="suspended">Suspended</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        name="avatar"
        label="Avatar"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload
          name="avatar"
          listType="picture"
          maxCount={1}
          beforeUpload={() => false} // Prevent auto upload
        >
          <Button icon={<UploadOutlined />}>Upload Avatar</Button>
        </Upload>
      </Form.Item>
      
      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={createMutation.isLoading || updateMutation.isLoading}
          >
            {isEditing ? "Update" : "Create"}
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default UserForm;