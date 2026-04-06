from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=7, max_length=30)
    password: str = Field(min_length=6, max_length=72)

    @model_validator(mode="after")
    def validate_contact(self) -> "RegisterRequest":
        if not self.email and not self.phone:
            raise ValueError("يجب إدخال البريد الإلكتروني أو رقم الجوال.")
        return self


class LoginRequest(BaseModel):
    email: EmailStr | None = None
    phone: str | None = None
    password: str = Field(min_length=6, max_length=72)

    @model_validator(mode="after")
    def validate_contact(self) -> "LoginRequest":
        if not self.email and not self.phone:
            raise ValueError("يجب إدخال البريد الإلكتروني أو رقم الجوال.")
        return self


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr | None
    phone: str | None
    is_active: bool
