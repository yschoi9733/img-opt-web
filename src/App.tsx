import { useState } from 'react';

import { uploadImage } from '@/api/upload';

// 상수 및 유틸 (컴포넌트 매 렌더마다 재생성 방지)
const MAX_SIZE = 40 * 1024 * 1024; // 40MB
const VALID_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('response' in error) {
      const axiosError = error as {
        response?: { status?: number; data?: unknown };
      };
      const status = axiosError.response?.status;
      if (status === 413) {
        return '파일 크기가 너무 큽니다. 서버에서 거부했습니다.';
      }
      if (status === 400) {
        return `잘못된 요청입니다: ${JSON.stringify(axiosError.response?.data)}`;
      }
      if (status === 500) {
        return '서버 내부 오류가 발생했습니다.';
      }
      return `이미지 업로드에 실패했습니다. (오류 코드: ${status || '알 수 없음'})`;
    }
    if ('code' in error) {
      const networkError = error as { code?: string; message?: string };
      if (networkError.code === 'ECONNABORTED') {
        return '업로드 시간이 초과되었습니다. 파일이 너무 크거나 네트워크가 느립니다.';
      }
      return `네트워크 오류: ${networkError.message || '알 수 없음'}`;
    }
  }
  return '이미지 업로드에 실패했습니다.';
}

function App() {
  // 상태 관리
  const [uploadedImagePreview, setUploadedImagePreview] = useState<
    string | null
  >(null);

  // 결과 이미지 URL (백엔드에서 받은 거 그대로 사용)
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 파일 선택 핸들러
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert(
        `파일이 너무 큽니다. 최대 ${MAX_SIZE / 1024 / 1024}MB까지 가능합니다.`,
      );
      return;
    }
    if (!VALID_TYPES.includes(file.type)) {
      alert(
        `지원하지 않는 형식: ${file.type || '알 수 없음'}\nJPG, PNG, WebP만 가능합니다.`,
      );
      return;
    }

    try {
      const preview = await readFileAsDataURL(file);
      setUploadedImagePreview(preview);
    } catch (readerErr) {
      console.error('FileReader error:', readerErr);
      alert('이미지 파일을 읽을 수 없습니다.');
      return;
    }

    await handleUpload(file);
  };

  // API 업로드 요청
  const handleUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const response = await uploadImage(file);
      setFinalImageUrl(response.optimizedUrl);
    } catch (error) {
      console.error('업로드 에러:', error);
      alert(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            이미지 리사이징 서비스
          </h1>
          <p className="mt-2 text-gray-600">
            이미지를 업로드하면 413x531 여권 사진 규격으로 자동 변환됩니다
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 왼쪽: 원본 이미지 업로드 */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              원본 이미지
            </h2>

            <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-gray-100 p-8">
              {uploadedImagePreview ? (
                <div className="relative flex h-full w-full items-center justify-center">
                  <img
                    src={uploadedImagePreview}
                    alt="원본 이미지"
                    className="max-h-80 max-w-full rounded-lg object-contain"
                  />
                  <label
                    htmlFor="file-upload"
                    className="absolute right-2 bottom-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
                  >
                    다시 업로드
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="file-upload"
                  className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-12"
                >
                  {/* SVG 아이콘 생략 (기존과 동일) */}
                  <div className="text-center">
                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      클릭하여 업로드
                    </p>
                    <p className="text-xs text-gray-500">JPG, PNG</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* 오른쪽: 결과 이미지 (옵션 제거됨) */}
          <div className="flex flex-col rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              변환 결과 (413x531)
            </h2>

            {/* 옵션 컨트롤(드롭다운) 있던 자리 -> 삭제됨 */}

            {/* 결과 이미지 미리보기 */}
            <div className="flex min-h-[250px] flex-1 items-center justify-center rounded-lg bg-gray-100 p-8">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="mb-2 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="text-sm text-gray-500">변환 중...</p>
                </div>
              ) : finalImageUrl ? (
                <img
                  src={finalImageUrl}
                  alt="리사이징 결과"
                  className="max-h-64 rounded-sm object-contain shadow-md"
                />
              ) : (
                <div className="text-center text-gray-400">
                  <p>
                    이미지를 업로드하면
                    <br />
                    자동으로 변환됩니다
                  </p>
                </div>
              )}
            </div>

            {/* 저장 안내 (버튼 제거) */}
            <p className="mt-4 text-center text-xs text-gray-500">
              이미지를 우클릭하여 &apos;다른 이름으로 저장&apos; 하세요.
            </p>

            {/* 리사이징 URL 표시 (업로드 전에도 UI 유지) */}
            <div className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-gray-700">
                  리사이징 이미지 URL:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={finalImageUrl || ''}
                    placeholder="아직 생성되지 않았습니다. 이미지를 업로드하세요."
                    className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 placeholder:text-gray-400"
                    onClick={e => e.currentTarget.select()}
                  />
                  <button
                    onClick={() => {
                      if (!finalImageUrl) return;
                      navigator.clipboard.writeText(finalImageUrl);
                      alert('URL이 복사되었습니다!');
                    }}
                    disabled={!finalImageUrl}
                    className={`rounded px-3 py-1.5 text-xs font-medium text-white transition ${finalImageUrl ? 'bg-gray-600 hover:bg-gray-700' : 'cursor-not-allowed bg-gray-300'}`}
                  >
                    복사
                  </button>
                </div>
                {!finalImageUrl && (
                  <p className="mt-2 text-[11px] text-gray-400">
                    업로드 완료 후 자동으로 URL이 표시됩니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
