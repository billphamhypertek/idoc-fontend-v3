export default function Header() {
  return (
    <>
      {/* Soft dark overlay to increase text contrast, fading to the right */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="relative h-full">
        <div className="h-full flex items-center justify-between px-6">
          {/* Left: Logo + Titles */}
          <div className="flex items-center">
            <img
              src="/v3/images/dashboard/logo-icon.png"
              alt="Ban Cơ yếu Chính phủ"
              className="img-fluid"
              style={{ width: "64px", height: "80px", objectFit: "contain" }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement!.innerHTML =
                  '<svg class="w-8 h-9 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l4 4-4 4-4-4 4-4zm0 6l4 4-4 4-4-4 4-4zm0 6l4 4-4 4-4-4 4-4z"/></svg>';
              }}
            />
            <div className="ml-3">
              <h1
                className="text-lg sm:text-xl font-bold mb-0 font-weight-bold truncate"
                style={{
                  lineHeight: "2rem",
                  fontSize: "1.25rem",
                  color: "rgb(178, 34, 34)",
                }}
              >
                BAN CƠ YẾU CHÍNH PHỦ
              </h1>
              <p
                className="text-xs sm:text-3xl mb-0 truncate font-weight-bold"
                style={{ color: "rgb(25, 118, 210)" }}
              >
                HỆ THỐNG QUẢN LÝ VĂN BẢN VÀ ĐIỀU HÀNH TÁC NGHIỆP
              </p>
            </div>
          </div>

          {/* Right: News banner image */}
          <div className="hidden md:block logo-bcy">
            <a
              href="https://bcy.gov.vn/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={"/v3/images/dashboard/trangtinnoibo.jpg"}
                alt="Trang tin nội bộ"
                className="rounded-lg"
                style={{ height: "80px", objectFit: "cover", opacity: 0.95 }}
                onError={(e) => {
                  // if missing, just hide the image gracefully
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
