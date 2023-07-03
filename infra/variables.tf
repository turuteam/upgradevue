
// Variables
variable "branch_name" {}

variable "domain" {
  default = "dev.arep.co"
}

variable "netlify_domain" {
  default = "netlify.app"
}

// Data sources
data "aws_route53_zone" "domain" {
  name         = var.domain
  private_zone = false
}
