import React from "react";
import { Button, Group, Placeholder } from "@vkontakte/vkui";

import {
  Icon28ArrowRightOutline,
  Icon56GestureOutline,
} from "@vkontakte/icons";

import { motion, button } from "framer-motion";

const container = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 1.5,
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

export default function Onboarding1(props) {
  return (
    <Group>
      <Placeholder
        header="Приветствуем в «Уведомлениях»!"
        icon={
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.5,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <Icon56GestureOutline style={{ marginBottom: -5 }} />
          </motion.div>
        }
        action={
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 1,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <Button
              style={{ marginTop: -10 }}
              onClick={() => {
                props.closeModal();
              }}
              size="l"
              after={
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={container}
                >
                  <Icon28ArrowRightOutline />
                </motion.div>
              }
            >
              Погнали дальше
            </Button>
          </motion.div>
        }
      >
        «Уведомления» — это сервис, который держит все уведомления в одном
        месте. Подключите любимые сервисы и получайте уведомления от них в общей
        ленте или в личные сообщения.
      </Placeholder>
    </Group>
  );
}
