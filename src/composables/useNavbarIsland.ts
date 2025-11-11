import { ref, Component } from 'vue'

interface NavbarIslandContent {
  component?: Component
  props?: Record<string, any>
}

const navbarIslandContent = ref<NavbarIslandContent | null>(null)

export function useNavbarIsland() {
  const setIslandContent = (content: NavbarIslandContent | null) => {
    navbarIslandContent.value = content
  }

  const clearIslandContent = () => {
    navbarIslandContent.value = null
  }

  return {
    navbarIslandContent,
    setIslandContent,
    clearIslandContent
  }
}
