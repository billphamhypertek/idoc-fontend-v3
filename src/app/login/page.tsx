"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ToastUtils } from "@/utils/toast.utils";
import useAuthStore from "@/stores/auth.store";
import useLoadingStore from "@/stores/loading.store";

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const loginSchema = z.object({
  userName: z.string().min(1, "Vui lòng nhập tên đăng nhập!"),
  password: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
  rememberPassword: z.string().default("false"),
  serialToken: z.string().default(""),
});

type LoginFormInput = z.input<typeof loginSchema>;
type LoginFormOutput = z.output<typeof loginSchema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { setLoading: setAppLoading } = useLoadingStore();
  const login = useAuthStore((s) => s.login);
  const router = useRouter();
  const getTokenInfoVgca = useAuthStore((s) => s.getTokenInfoVgca);
  const loginWithUsb = useAuthStore((s) => s.loginWithUsb);
  const defaultValues = useMemo<LoginFormInput>(
    () => ({
      userName: "",
      password: "",
      rememberPassword: "false",
      serialToken: "",
    }),
    []
  );
  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
    defaultValues,
  });

  const onSubmit = useCallback(
    async (raw: LoginFormInput) => {
      setLoading(true);
      const data: LoginFormOutput = loginSchema.parse(raw);
      try {
        await login(data);
        ToastUtils.success("Đăng nhập thành công!");
        router.replace("/");
      } catch (error: unknown) {
        const errorResponse = error as ErrorResponse;
        ToastUtils.error(
          errorResponse?.response?.data?.message ||
            "Đăng nhập thất bại. Vui lòng thử lại."
        );
      } finally {
        setLoading(false);
      }
    },
    [login, router]
  );

  const loginTokenVgca = useCallback(async () => {
    try {
      const data = await getTokenInfoVgca();
      const tokenInfo = JSON.parse(data);

      if (tokenInfo.Status === 0) {
        const serialNumber = tokenInfo.CertInfo.Base64Data;
        await loginWithUsb(serialNumber);

        const userInfo = useAuthStore.getState().user;
        if (userInfo?.forgetPassword) {
          router.push(`/info/${userInfo.userName}`);
        } else {
          router.push("/");
        }
      } else {
        ToastUtils.error(
          tokenInfo.Message || "Đăng nhập bằng USB thất bại. Vui lòng thử lại."
        );
      }
    } catch (error: unknown) {
      const errorResponse = error as ErrorResponse;
      console.error("Lỗi lấy token từ USB:", errorResponse);
      ToastUtils.error(
        errorResponse?.response?.data?.message ||
          "Đăng nhập bằng USB thất bại. Vui lòng thử lại."
      );
    }
  }, [getTokenInfoVgca, loginWithUsb, router]);
  useEffect(() => {
    setAppLoading(false); // set loading khi logout thanh cong
  }, [setAppLoading]);

  const wordFilePath = "/v3/files/HDSK-su-dung.docx";
  const videoZipPath = "/v3/files/VIDEO-HDSD-KY-SO.zip";

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-red-800 to-red-900 py-12 px-4 sm:px-6 lg:px-8 bg-center"
      style={{
        backgroundImage: 'url("/v3/images/BackgroundBCY.png")',
        backgroundSize: "cover",
      }}
    >
      <div className="w-[440px] min-w-[420px] space-y-4 mt-[10%] py-6 px-1">
        <Card className="shadow-lg rounded-md">
          <CardHeader className="text-center">
            <h5 className="text-[16px] text-gray-800 font-bold mt-2">
              QUẢN LÝ VĂN BẢN & ĐIỀU HÀNH TÁC NGHIỆP
            </h5>
          </CardHeader>
          <CardContent className="px-3 pb-14">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 -mt-3"
            >
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100/80 z-0"></div>
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 z-20" />
                  <Input
                    id="userName"
                    placeholder="Tên đăng nhập"
                    className="pl-[56px] h-11 text-lg placeholder:text-lg rounded-none relative z-10"
                    {...form.register("userName")}
                  />
                </div>
                {form.formState.errors.userName && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.userName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="relative -mt-2">
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-100 z-0"></div>
                  <Pencil className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 z-20" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mật khẩu"
                    className="pl-[56px] h-11 text-lg placeholder:text-lg rounded-none relative z-10"
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              <input
                type="hidden"
                {...form.register("rememberPassword")}
                value="false"
              />
              <input type="hidden" {...form.register("serialToken")} value="" />

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-red-600 hover:bg-red-700 font-semibold text-[17px] rounded-none -mt-2"
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full h-10 border-red-600 text-red-600 hover:border-red-700 hover:text-white hover:bg-[#c00] font-extrabold text-[14px] rounded-none"
                onClick={loginTokenVgca}
              >
                Đăng nhập USB Token
              </Button>
            </div>
            <div className="text-center mt-4 space-y-4">
              <a
                href="https://wiki.bcy.gov.vn/vi/idoc/ky-so"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-500"
                title="HDSK ký số (Wiki BCY)"
                aria-label="HDSK ký số bằng file word"
              >
                HDSD ký số bằng file word
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-500">
                Video HDSK ký số
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
