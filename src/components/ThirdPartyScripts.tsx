import { useEffect } from "react";
import { useActiveIntegrations } from "@/hooks/useThirdPartyIntegrations";

export function ThirdPartyScripts() {
  const { data: integrations } = useActiveIntegrations();

  useEffect(() => {
    if (!integrations || integrations.length === 0) return;

    // Inject head scripts
    integrations.forEach((integration) => {
      if (integration.head_code) {
        const headScriptId = `third-party-head-${integration.slug}`;
        if (!document.getElementById(headScriptId)) {
          const container = document.createElement("div");
          container.id = headScriptId;
          container.innerHTML = integration.head_code;
          
          // Move scripts to head properly
          const scripts = container.querySelectorAll("script");
          scripts.forEach((script) => {
            const newScript = document.createElement("script");
            Array.from(script.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = script.textContent;
            document.head.appendChild(newScript);
          });

          // Handle non-script elements (like meta tags, link tags)
          const nonScripts = container.querySelectorAll(":not(script)");
          nonScripts.forEach((el) => {
            const clone = el.cloneNode(true) as Element;
            clone.setAttribute("data-integration", integration.slug);
            document.head.appendChild(clone);
          });
        }
      }

      // Inject body start scripts
      if (integration.body_start_code) {
        const bodyStartId = `third-party-body-start-${integration.slug}`;
        if (!document.getElementById(bodyStartId)) {
          const container = document.createElement("div");
          container.id = bodyStartId;
          container.innerHTML = integration.body_start_code;
          
          const scripts = container.querySelectorAll("script");
          scripts.forEach((script) => {
            const newScript = document.createElement("script");
            Array.from(script.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = script.textContent;
            document.body.insertBefore(newScript, document.body.firstChild);
          });

          const nonScripts = container.querySelectorAll(":not(script)");
          nonScripts.forEach((el) => {
            const clone = el.cloneNode(true) as Element;
            clone.setAttribute("data-integration", integration.slug);
            document.body.insertBefore(clone, document.body.firstChild);
          });
        }
      }

      // Inject body end scripts
      if (integration.body_end_code) {
        const bodyEndId = `third-party-body-end-${integration.slug}`;
        if (!document.getElementById(bodyEndId)) {
          const container = document.createElement("div");
          container.id = bodyEndId;
          container.innerHTML = integration.body_end_code;
          
          const scripts = container.querySelectorAll("script");
          scripts.forEach((script) => {
            const newScript = document.createElement("script");
            Array.from(script.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = script.textContent;
            document.body.appendChild(newScript);
          });

          const nonScripts = container.querySelectorAll(":not(script)");
          nonScripts.forEach((el) => {
            const clone = el.cloneNode(true) as Element;
            clone.setAttribute("data-integration", integration.slug);
            document.body.appendChild(clone);
          });
        }
      }
    });

    // Cleanup function to remove scripts when integrations change
    return () => {
      integrations.forEach((integration) => {
        // Remove elements by data-integration attribute
        document.querySelectorAll(`[data-integration="${integration.slug}"]`).forEach((el) => el.remove());
      });
    };
  }, [integrations]);

  return null;
}
