module "route53" {
  source  = "git@bitbucket.org:audiencerepublic/infra-modules.git//route53/public?ref=v0.0.6"
  zone_id = data.aws_route53_zone.domain.zone_id
  records = [
    {
      name = var.branch_name, value = ["${var.branch_name}.${var.netlify_domain}"]
    }
  ]
}

