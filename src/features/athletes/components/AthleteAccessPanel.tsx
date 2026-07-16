import { Copy, MailPlus, RefreshCw, UserX } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  disableAthleteAccess,
  inviteAthlete,
  resendAthleteInvitation,
  type AthleteInvitation,
} from "../../../api/athletes.api";
import { normalizeApiError } from "../../../api/api-client";
import { Button } from "../../../components/common/Button";
import { Card } from "../../../components/common/Card";
import { useToast } from "../../../components/feedback/Toast";
import { Input } from "../../../components/forms/Fields";

export function AthleteAccessPanel({ athleteId }: { athleteId: string }) {
  const [email, setEmail] = useState("");
  const [invitation, setInvitation] = useState<AthleteInvitation | null>(null);
  const [pending, setPending] = useState<
    "invite" | "resend" | "disable" | null
  >(null);
  const { showToast } = useToast();
  const run = async (
    action: () => Promise<AthleteInvitation>,
    kind: "invite" | "resend",
  ) => {
    setPending(kind);
    try {
      const result = await action();
      setInvitation(result);
      showToast(
        kind === "invite" ? "Athlete invitation created" : "Invitation resent",
      );
    } catch (error) {
      showToast(normalizeApiError(error).message, "error");
    } finally {
      setPending(null);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    void run(() => inviteAthlete(athleteId, email), "invite");
  };
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-bold">Athlete account access</h2>
      <p className="mt-1 text-sm text-gray-600">
        Invite this athlete to their private CoachOS workspace.
      </p>
      {!invitation ? (
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={submit}
        >
          <Input
            aria-label="Athlete account email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="athlete@example.com"
          />
          <Button
            type="submit"
            icon={MailPlus}
            isLoading={pending === "invite"}
          >
            Send invitation
          </Button>
        </form>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm">
            <span className="font-semibold">{invitation.email}</span> ·{" "}
            <span className="capitalize">{invitation.status}</span>
          </p>
          {invitation.development_invitation_url && (
            <Button
              variant="secondary"
              icon={Copy}
              onClick={() => {
                void navigator.clipboard.writeText(
                  invitation.development_invitation_url ?? "",
                );
                showToast("Development invitation link copied");
              }}
            >
              Copy development link
            </Button>
          )}
          <div className="flex flex-wrap gap-2">
            {invitation.status === "invited" && (
              <Button
                variant="secondary"
                icon={RefreshCw}
                isLoading={pending === "resend"}
                onClick={() =>
                  run(
                    () => resendAthleteInvitation(athleteId, invitation.email),
                    "resend",
                  )
                }
              >
                Resend
              </Button>
            )}
            {invitation.status !== "disabled" && (
              <Button
                variant="danger"
                icon={UserX}
                isLoading={pending === "disable"}
                onClick={async () => {
                  setPending("disable");
                  try {
                    await disableAthleteAccess(athleteId);
                    setInvitation({ ...invitation, status: "disabled" });
                    showToast("Athlete access disabled");
                  } catch (error) {
                    showToast(normalizeApiError(error).message, "error");
                  } finally {
                    setPending(null);
                  }
                }}
              >
                Disable access
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
