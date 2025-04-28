import MainLayout from "@/components/layout/MainLayout";
import { FaRocket } from "react-icons/fa";

export default function UpdatesPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-16 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <FaRocket className="text-yellow-500 mr-3 text-2xl" />
            <h1 className="text-3xl font-bold text-gray-800">DeepSeek-V3 模型更新</h1>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">各项能力全面进阶</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">理解能力</h3>
                <p className="text-gray-600">
                  DeepSeek-V3在复杂语境理解和细节把握上有了显著提升，能更准确地理解用户的复杂需求，减少使用过程中的误解和混淆。
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">创作能力</h3>
                <p className="text-gray-600">
                  新的模型在文本创作方面有了质的飞跃，无论是写作风格、内容丰富度还是逻辑连贯性，都更贴近人类高质量创作水平。
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">多轮对话</h3>
                <p className="text-gray-600">
                  提升了多轮对话中的上下文维持能力，在长对话中依然能保持高度的连贯性和一致性，不易遗忘前文内容。
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">知识更新</h3>
                <p className="text-gray-600">
                  DeepSeek-V3包含了更新的知识库，涵盖了更广泛的领域知识和最新的事实信息。
                </p>
              </div>
            </div>
            
            <div className="mt-12 border-t border-gray-100 pt-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-6">全平台上线</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">网页端</h3>
                  <p className="text-gray-600">
                    在DeepSeek网页版上体验全新V3模型，享受流畅的对话体验和完整功能。
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">移动APP</h3>
                  <p className="text-gray-600">
                    DeepSeek手机应用已更新支持V3模型，随时随地享受强大AI能力。
                  </p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">API服务</h3>
                  <p className="text-gray-600">
                    为开发者提供V3模型API接口，轻松集成到您自己的应用中。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <a 
                href="/chat" 
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                立即体验 DeepSeek-V3
              </a>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 