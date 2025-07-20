import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Undo } from "lucide-react";

interface ReturnPrivacyProps {
  returnPolicy?: string;
  loading: boolean;
}

export default function ReturnPrivacy({
  returnPolicy,
  loading,
}: ReturnPrivacyProps) {
  return (
    <div className="mt-2 space-y-2">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Policies & Security
              </h2>

              <div className="space-y-4">
                {/* Return Policy */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white flex-shrink-0 mt-0.5">
                    <Undo className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">Return Policy</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {returnPolicy}
                    </p>
                  </div>
                </div>

                {/* Security & Privacy */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0 mt-0.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">
                      Security & Privacy
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Safe payments:</span> We
                        do not share your personal details with any third
                        parties without your consent.
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">
                          Secure personal details:
                        </span>{" "}
                        We protect your privacy and keep your personal details
                        safe and secure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
