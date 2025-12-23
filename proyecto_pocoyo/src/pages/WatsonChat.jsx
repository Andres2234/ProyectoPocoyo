import { useEffect } from "react";

const WatsonChat = () => {
  useEffect(() => {
    window.watsonAssistantChatOptions = {
      integrationID: "eb314627-3c61-47c9-8055-a66990c1878e",
      region: "us-south",
      serviceInstanceID: "73cdfa06-9b6b-4e41-90f9-e6e9b5d16fb2",
      onLoad: async (instance) => {
        await instance.render();
      }
    };

    const script = document.createElement("script");
    script.src =
      "https://web-chat.global.assistant.watson.appdomain.cloud/versions/latest/WatsonAssistantChatEntry.js";
    script.async = true;

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default WatsonChat;
