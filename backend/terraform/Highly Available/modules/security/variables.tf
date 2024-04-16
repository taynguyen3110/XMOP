variable "vpc_id" {
  default     = ""
  type        = string
  description = "ID of the VPC"
}

variable "lb_ingress" {
  default = []
  type    = any
}

variable "lb_egress" {
  default = []
  type    = any
}

variable "id" {
  type = string
}
